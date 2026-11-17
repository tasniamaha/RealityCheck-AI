"""
Learn from expert reviews now, instead of waiting for the automatic run.

    python manage.py learn            train, check on testset/, switch on only if better
    python manage.py learn --status   show progress toward the thresholds
"""

import json

from django.core.management.base import BaseCommand

from detector import learning


class Command(BaseCommand):
    help = 'Train the expert-trained detector and weights from expert reviews (checked on testset/).'

    def add_arguments(self, parser):
        parser.add_argument('--status', action='store_true', help='Only show progress')

    def handle(self, *args, **opts):
        info = learning.collect()
        progress = learning._progress(info)
        self.stdout.write(f'Reviews: {progress["reviews"]["fake"]} FAKE with a reason, '
                          f'{progress["reviews"]["real"]} REAL (test-set images excluded).')
        self.stdout.write(f'Needed: {learning.MIN_FAKE_SAME_REASON} FAKE with the same reason '
                          f'and {learning.MIN_REAL} REAL.')
        for g in progress['reasons']:
            self.stdout.write(f'  {g["count"]:>4}  {g["label"]:<30} e.g. "{g["examples"][0]}"')
        if opts['status']:
            last = learning.read_status().get('last_run')
            if last:
                self.stdout.write('\nLast run: ' + json.dumps(
                    {k: last[k] for k in ('finished_at', 'accepted', 'before', 'after')}, indent=2))
            return
        learning.run(log=self.stdout.write)
