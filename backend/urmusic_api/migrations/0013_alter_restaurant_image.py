# Generated by Django 3.2.13 on 2022-05-28 21:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('urmusic_api', '0012_favouriterestaurant'),
    ]

    operations = [
        migrations.AlterField(
            model_name='restaurant',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='restaurant_images/'),
        ),
    ]