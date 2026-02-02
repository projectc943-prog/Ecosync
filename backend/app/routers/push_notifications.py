"""
Push Notification Router
Handles web push notification subscriptions and sending
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json
from pywebpush import webpush, WebPushException
import os
from dotenv import load_dotenv

from .. import models, database
from .auth_v2 import get_current_user

load_dotenv()

router = APIRouter(prefix="/api/push", tags=["push-notifications"])

# VAPID keys (will be generated and stored in .env)
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIMS = {
    "sub": "mailto:sreekar092004@gmail.com"  # Contact email
}


class PushSubscriptionRequest(BaseModel):
    subscription: dict  # Contains endpoint, keys (p256dh, auth)


class PushNotificationPayload(BaseModel):
    title: str
    body: str
    icon: Optional[str] = "/favicon.ico"
    badge: Optional[str] = "/favicon.ico"
    tag: Optional[str] = "ecosync-alert"
    requireInteraction: Optional[bool] = True
    data: Optional[dict] = {"url": "/dashboard"}


@router.post("/subscribe")
async def subscribe_to_push(
    request: PushSubscriptionRequest,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Save or update push subscription for the current user
    """
    try:
        subscription_data = request.subscription
        endpoint = subscription_data.get("endpoint")
        keys = subscription_data.get("keys", {})
        p256dh = keys.get("p256dh")
        auth = keys.get("auth")

        if not endpoint or not p256dh or not auth:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid subscription data"
            )

        # Check if subscription already exists
        existing_sub = db.query(models.PushSubscription).filter(
            models.PushSubscription.endpoint == endpoint
        ).first()

        if existing_sub:
            # Update existing subscription
            existing_sub.p256dh = p256dh
            existing_sub.auth = auth
            existing_sub.is_active = True
            existing_sub.user_id = current_user.id
        else:
            # Create new subscription
            new_sub = models.PushSubscription(
                user_id=current_user.id,
                endpoint=endpoint,
                p256dh=p256dh,
                auth=auth,
                is_active=True
            )
            db.add(new_sub)

        db.commit()

        return {
            "success": True,
            "message": "Push subscription saved successfully"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save subscription: {str(e)}"
        )


@router.post("/unsubscribe")
async def unsubscribe_from_push(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Deactivate all push subscriptions for the current user
    """
    try:
        db.query(models.PushSubscription).filter(
            models.PushSubscription.user_id == current_user.id
        ).update({"is_active": False})
        
        db.commit()

        return {
            "success": True,
            "message": "Push subscriptions deactivated"
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unsubscribe: {str(e)}"
        )


@router.post("/test")
async def send_test_notification(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Send a test push notification to the current user
    """
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="VAPID keys not configured. Run generate_vapid_keys.py first."
        )

    # Get user's active subscriptions
    subscriptions = db.query(models.PushSubscription).filter(
            models.PushSubscription.user_id == current_user.id,
            models.PushSubscription.is_active == True
    ).all()

    if not subscriptions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active push subscriptions found"
        )

    # Prepare notification payload
    payload = {
        "title": "🌿 EcoSync Test Notification",
        "body": "Push notifications are working! You'll receive alerts even when the tab is closed.",
        "icon": "/favicon.ico",
        "badge": "/favicon.ico",
        "tag": "ecosync-test",
        "requireInteraction": False,
        "data": {"url": "/dashboard"}
    }

    sent_count = 0
    failed_count = 0

    for sub in subscriptions:
        try:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }

            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            sent_count += 1

        except WebPushException as e:
            print(f"Push failed for subscription {sub.id}: {e}")
            failed_count += 1
            
            # If subscription is invalid (410 Gone), deactivate it
            if e.response and e.response.status_code == 410:
                sub.is_active = False
                db.commit()

    return {
        "success": True,
        "sent": sent_count,
        "failed": failed_count,
        "message": f"Test notification sent to {sent_count} device(s)"
    }


def send_push_notification_to_user(
    user_id: int,
    payload: dict,
    db: Session
):
    """
    Utility function to send push notification to a specific user
    Used by alert system
    """
    if not VAPID_PRIVATE_KEY or not VAPID_PUBLIC_KEY:
        print("⚠️ VAPID keys not configured, skipping push notification")
        return False

    # Get user's active subscriptions
    subscriptions = db.query(models.PushSubscription).filter(
        models.PushSubscription.user_id == user_id,
        models.PushSubscription.is_active == True
    ).all()

    if not subscriptions:
        print(f"⚠️ No active push subscriptions for user {user_id}")
        return False

    sent_count = 0

    for sub in subscriptions:
        try:
            subscription_info = {
                "endpoint": sub.endpoint,
                "keys": {
                    "p256dh": sub.p256dh,
                    "auth": sub.auth
                }
            }

            webpush(
                subscription_info=subscription_info,
                data=json.dumps(payload),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims=VAPID_CLAIMS
            )
            sent_count += 1
            print(f"Push notification sent to user {user_id}")

        except WebPushException as e:
            print(f"❌ Push failed for subscription {sub.id}: {e}")
            
            # If subscription is invalid (410 Gone), deactivate it
            if e.response and e.response.status_code == 410:
                sub.is_active = False
                db.commit()

    return sent_count > 0
