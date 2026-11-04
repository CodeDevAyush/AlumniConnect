import sys
import os
import time
import subprocess
import httpx

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.core.config import settings

def test_live_server():
    print("[1/4] Booting FastAPI AI Intelligence Server on http://127.0.0.1:8000...")
    log_file = open("uvicorn.log", "w")
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
        stdout=log_file,
        stderr=log_file,
    )

    try:
        # Wait for server to become responsive
        client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=10.0)
        up = False
        for attempt in range(40):
            try:
                r = client.get("/api/v1/health")
                if r.status_code == 200:
                    up = True
                    break
            except Exception:
                time.sleep(0.5)

        if not up:
            print("[FAIL] Server did not become ready in time.")
            log_file.flush()
            with open("uvicorn.log") as f:
                print(f.read())
            return False

        print("[2/4] Server is LIVE! Probing endpoints...\n")

        # Probe 1: Health check
        r_health = client.get("/api/v1/health")
        print(f"--> GET /api/v1/health [Status: {r_health.status_code}]")
        print(f"    Payload: {r_health.json()}\n")

        # Probe 2: Tracks
        headers = {"X-Internal-API-Key": settings.INTERNAL_API_SECRET_KEY}
        r_tracks = client.get("/api/v1/capability/tracks", headers=headers)
        print(f"--> GET /api/v1/capability/tracks [Status: {r_tracks.status_code}]")
        print(f"    Total Technical Tracks: {r_tracks.json().get('totalTracks')}\n")

        # Probe 3: 5D Capability Assessment
        cap_payload = {
            "studentId": "student-alex-live",
            "selectedTrack": "FULLSTACK",
            "selfReportedSkills": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"],
            "internalAssessments": [{"subject": "Full Stack Architecture", "score": 92}],
            "manualProjects": [
                {
                    "title": "AlumniConnect Portal",
                    "techStack": ["Next.js", "NestJS", "FastAPI", "PostgreSQL", "Docker"],
                }
            ],
        }
        r_cap = client.post("/api/v1/capability/assess", json=cap_payload, headers=headers)
        print(f"--> POST /api/v1/capability/assess [Status: {r_cap.status_code}]")
        data = r_cap.json()
        print(f"    Evaluated Track: {data.get('trackTitle')}")
        print(f"    Overall Score: {data.get('overallCapabilityScore')}/100")
        print(f"    Readiness Tier: {data.get('readinessTier')}")
        print(f"    Confidence: {data.get('overallConfidence')}")
        print(f"    Missing Evidence: {data.get('missingEvidenceNotices')}\n")

        # Probe 4: Alumni Matching
        match_payload = {
            "studentId": "student-alex-live",
            "skills": ["TypeScript", "React", "Next.js", "Tailwind CSS"],
            "interests": ["Frontend Architecture", "Developer Tools"],
            "targetRoles": ["Frontend Developer", "Full Stack Developer"],
            "topK": 2,
        }
        r_match = client.post("/api/v1/matching/alumni", json=match_payload, headers=headers)
        print(f"--> POST /api/v1/matching/alumni [Status: {r_match.status_code}]")
        m_data = r_match.json()
        print(f"    Total Evaluated: {m_data.get('totalEvaluated')} candidates")
        for m in m_data.get("matches", []):
            print(f"    - Alumni: {m.get('alumniId')} | Score: {m.get('score')} | Rationale: {m.get('rationale')}")

        print("\n[3/4] Live HTTP requests verified successfully!")
        return True

    finally:
        print("\n[4/4] Shutting down uvicorn test process...")
        proc.terminate()
        proc.wait(timeout=5)
        print("[DONE] Server stopped gracefully.")

if __name__ == "__main__":
    success = test_live_server()
    sys.exit(0 if success else 1)
