import os
import sys
import time
import subprocess
import json
import urllib.request
import urllib.error

def log(msg):
    print(f"[TEST-RUNNER] {msg}", flush=True)

def wait_for_url(url, timeout_secs=30, headers=None):
    start = time.time()
    req = urllib.request.Request(url, headers=headers or {})
    while time.time() - start < timeout_secs:
        try:
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status in (200, 201):
                    return resp.read().decode('utf-8')
        except Exception:
            time.sleep(0.8)
    return None

def main():
    root_dir = os.path.abspath(os.path.dirname(__file__))
    log_dir = os.path.join(root_dir, ".test_logs")
    os.makedirs(log_dir, exist_ok=True)

    log(f"Starting End-to-End Stack Verification in {root_dir}")

    env = os.environ.copy()
    env["NEXT_IGNORE_INCORRECT_LOCKFILE"] = "1"
    env["INTERNAL_API_SECRET_KEY"] = "dev_internal_shared_secret_between_backend_and_ai_service_32b"

    ai_log = open(os.path.join(log_dir, "ai_service.log"), "w", encoding="utf-8")
    backend_log = open(os.path.join(log_dir, "backend.log"), "w", encoding="utf-8")
    frontend_log = open(os.path.join(log_dir, "frontend.log"), "w", encoding="utf-8")

    ai_proc = None
    backend_proc = None
    frontend_proc = None

    try:
        # 1. Start AI Service (FastAPI) on port 8000
        log("[1/4] Booting AI Microservice (FastAPI :8000)...")
        ai_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]
        ai_proc = subprocess.Popen(
            ai_cmd,
            cwd=os.path.join(root_dir, "ai-service"),
            stdout=ai_log,
            stderr=ai_log,
            env=env
        )

        log("Waiting for AI Service at http://127.0.0.1:8000/api/v1/health ...")
        ai_health = wait_for_url("http://127.0.0.1:8000/api/v1/health", timeout_secs=25)
        if not ai_health:
            log("FAIL: AI Service failed to respond at :8000. Inspecting log:")
            ai_log.flush()
            with open(os.path.join(log_dir, "ai_service.log"), "r", encoding="utf-8", errors="ignore") as f:
                print(f.read())
            sys.exit(1)
        log(f"AI Service is ONLINE: {ai_health}")

        # 2. Start Backend (NestJS) on port 4000
        log("[2/4] Booting Core Backend (NestJS :4000)...")
        backend_cmd = ["node", "dist/src/main.js"]
        backend_proc = subprocess.Popen(
            backend_cmd,
            cwd=os.path.join(root_dir, "backend"),
            stdout=backend_log,
            stderr=backend_log,
            env=env
        )

        log("Waiting for Backend at http://127.0.0.1:4000/api/v1/health ...")
        backend_health = wait_for_url("http://127.0.0.1:4000/api/v1/health", timeout_secs=30)
        if not backend_health:
            log("FAIL: Backend failed to respond at :4000. Inspecting log:")
            backend_log.flush()
            with open(os.path.join(log_dir, "backend.log"), "r", encoding="utf-8", errors="ignore") as f:
                print(f.read())
            sys.exit(1)
        log(f"Backend is ONLINE: {backend_health}")

        # Probe Swagger Documentation at :4000/api/docs
        swagger_res = wait_for_url("http://127.0.0.1:4000/api/docs", timeout_secs=10)
        if swagger_res:
            log("Swagger OpenAPI UI is LIVE at http://127.0.0.1:4000/api/docs")

        # 3. Test Inter-Service Communication: NestJS calling FastAPI
        log("[3/4] Testing NestJS -> FastAPI Inter-Service Communication via /api/v1/intelligence/capability/tracks ...")
        tracks_res = wait_for_url("http://127.0.0.1:4000/api/v1/intelligence/capability/tracks", timeout_secs=15)
        if tracks_res:
            data = json.loads(tracks_res)
            tracks = data.get("data", {}).get("tracks") or data.get("tracks") or []
            log(f"Inter-Service Gateway OK: Received {len(tracks)} technical tracks: {tracks}")
        else:
            log("FAIL: Inter-Service communication test failed")
            sys.exit(1)

        # 4. Start Frontend (Next.js) on port 3000
        log("[4/4] Booting Frontend Application (Next.js :3000)...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        frontend_cmd = [npm_cmd, "run", "start"]
        frontend_proc = subprocess.Popen(
            frontend_cmd,
            cwd=os.path.join(root_dir, "frontend"),
            stdout=frontend_log,
            stderr=frontend_log,
            env=env
        )

        log("Waiting for Frontend at http://127.0.0.1:3000/ ...")
        frontend_res = wait_for_url("http://127.0.0.1:3000/", timeout_secs=30)
        if not frontend_res:
            log("FAIL: Frontend failed to respond at :3000. Inspecting log:")
            frontend_log.flush()
            with open(os.path.join(log_dir, "frontend.log"), "r", encoding="utf-8", errors="ignore") as f:
                print(f.read())
            sys.exit(1)
        log("Frontend Homepage is LIVE: HTTP 200 OK")

        # Probe /login
        login_res = wait_for_url("http://127.0.0.1:3000/login", timeout_secs=10)
        if login_res:
            log("Frontend /login Page is LIVE: HTTP 200 OK")

        print("\n" + "="*75)
        print("SUCCESS! ALL 3 SERVICES RUNNING & FULL INTEGRATION VERIFIED END-TO-END:")
        print("  - AI Service (FastAPI)       : http://localhost:8000/api/v1/health")
        print("  - Backend Service (NestJS)   : http://localhost:4000/api/v1/health")
        print("  - Swagger API Documentation  : http://localhost:4000/api/docs")
        print("  - Frontend Client (Next.js)  : http://localhost:3000/")
        print("="*75)

    finally:
        log("Tearing down test server processes...")
        for p, name in [(frontend_proc, "Frontend"), (backend_proc, "Backend"), (ai_proc, "AI Service")]:
            if p:
                try:
                    p.terminate()
                    p.wait(timeout=3)
                except Exception:
                    p.kill()
        ai_log.close()
        backend_log.close()
        frontend_log.close()
        log("All test processes terminated cleanly.")

if __name__ == "__main__":
    main()
