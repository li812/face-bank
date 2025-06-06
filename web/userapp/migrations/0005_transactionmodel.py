# Generated by Django 5.1.7 on 2025-03-11 15:39

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('branchapp', '0002_complaintmodel'),
        ('userapp', '0004_familymodel'),
    ]

    operations = [
        migrations.CreateModel(
            name='TransactionModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('receiver_account_number', models.IntegerField()),
                ('receiver_name', models.CharField(max_length=50)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('otp', models.IntegerField(blank=True, null=True)),
                ('is_verified', models.BooleanField(default=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('account_number', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='userapp.accountmodel')),
                ('branch_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='branchapp.branchmodel')),
                ('username', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='userapp.usermodel')),
            ],
        ),
    ]
