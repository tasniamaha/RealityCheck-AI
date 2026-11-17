from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [('detector', '0005_scan_owner_and_complaints')]

    operations = [
        migrations.AddField(model_name='scanresult', name='openfake_prob',
                            field=models.FloatField(blank=True, null=True)),
    ]
