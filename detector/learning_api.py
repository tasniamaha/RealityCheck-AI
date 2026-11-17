"""
learning_api.py - admin endpoint for learning from expert reviews.

GET  /api/admin/learning/            progress, reasons so far, last run
POST /api/admin/learning/  {}        start a run now (if the thresholds are met)
"""

import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from detector import learning


@csrf_exempt
def api_admin_learning(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'error': 'Admin access required'}, status=403)

    if request.method == 'POST':
        started = learning.maybe_start(force=True)
        status = learning.read_status()
        if not started and not status.get('progress', {}).get('ready'):
            return JsonResponse({'started': False, 'status': status,
                                 'error': 'Not enough expert reviews yet.'}, status=400)
        return JsonResponse({'started': started, 'status': status})

    learning.maybe_start()          # refreshes the progress counts; starts a run only if one is due
    return JsonResponse({'status': learning.read_status()})
