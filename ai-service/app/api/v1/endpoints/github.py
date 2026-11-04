from fastapi import APIRouter, Depends
from app.integrations.github_client import github_client
from app.core.security import verify_internal_api_key

router = APIRouter()


@router.get(
    "/github/evaluate/{username}",
    dependencies=[Depends(verify_internal_api_key)],
    tags=["GitHub Integration"],
)
async def evaluate_github(username: str):
    """
    Retrieves and aggregates signals directly from GitHub user account.
    Requires internal service authentication.
    """
    return await github_client.evaluate_github_profile(username)
