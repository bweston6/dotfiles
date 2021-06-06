#!/bin/bash

# This is a one-time script to be run after installation. It installs all programs and initialises configuration.

# Ensure that dotfiles are in /tmp
SYSTEM="main"
git clone -b $SYSTEM https://github.com/bweston6/dotfiles.git /mnt/tmp/dotfiles

# Creating User
echo "Enter username for non-privileged user:"
read NAME
useradd -m -G wheel -s /bin/zsh $NAME
echo "Enter a password for $NAME (you will soon be editing the sudoers file; allow wheel access):"
passwd $NAME
visudo

# Configuring Network
echo "Configuring Network - This will only work with Ethernet"


# Installing system-specific programs

