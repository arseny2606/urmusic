# Generated by Django 3.2.9 on 2022-03-24 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('urmusic_api', '0007_restaurant_track_trackorder'),
    ]

    operations = [
        migrations.AlterField(
            model_name='restaurant',
            name='image',
            field=models.ImageField(upload_to='restaurant_images/'),
        ),
        migrations.AlterField(
            model_name='user',
            name='avatar',
            field=models.ImageField(null=True, upload_to='avatars/'),
        ),
    ]