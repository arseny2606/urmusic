# Generated by Django 4.0.3 on 2022-03-24 15:44

import datetime
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('urmusic_api', '0006_auto_20220323_1740'),
    ]

    operations = [
        migrations.CreateModel(
            name='Restaurant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('address', models.CharField(max_length=150)),
                ('image', models.ImageField(upload_to='')),
                ('owner', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Track',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.TextField(default='track')),
            ],
        ),
        migrations.CreateModel(
            name='TrackOrder',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('creation_time', models.DateTimeField(default=datetime.datetime.now)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('restaurant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='urmusic_api.restaurant')),
                ('track', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='urmusic_api.track')),
            ],
        ),
    ]