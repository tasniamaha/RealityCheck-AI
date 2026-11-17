import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('detector', '0004_scanresult_expert_prob'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='scanresult',
            name='uploaded_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                    related_name='scans', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Complaint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('reason', models.CharField(max_length=200)),
                ('details', models.TextField(blank=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('resolved', 'Resolved'), ('dismissed', 'Dismissed')],
                                            default='pending', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reporter', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL,
                                               related_name='complaints', to=settings.AUTH_USER_MODEL)),
                ('scan', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE,
                                           related_name='complaints', to='detector.scanresult')),
            ],
            options={'ordering': ['-created_at']},
        ),
    ]
