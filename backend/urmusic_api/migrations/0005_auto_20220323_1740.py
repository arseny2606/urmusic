# Generated by Django 3.2.9 on 2022-03-23 14:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('urmusic_api', '0004_auto_20220320_1548'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='avatar',
            field=models.ImageField(null=True, upload_to=''),
        ),
        migrations.AddField(
            model_name='user',
            name='city',
            field=models.CharField(default='Москва', max_length=200),
            preserve_default=False,
        ),
    ]
