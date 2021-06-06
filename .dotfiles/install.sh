#!/bin/bash

# This section runs under the arch installer (as root)

# Ask to Confirm Mountpoints
if ! mountpoint -q -- "/mnt";
then
	echo "There is no filesystem mounted at /mnt."
	exit
elif ! mountpoint -q -- "/mnt/boot";
then
	echo "There is no filesystem mounted at /mnt/boot."
	exit
fi

# Fetching System Branch
SYSTEM=$(git branch --show-current)
if [ "$SYSTEM" = "fatal: not a git repository (or any of the parent directories): .git"];
then
	echo "Please run this script from within the dotfiles folder."
	exit
fi

# Installing Base Programs
reflector --sort delay -f 10 -l 20 --completion-percent 100 --save /etc/pacman.d/mirrorlist
pacstrap /mnt base linux linux-firmware - < packages.txt

# Configuring the System
genfstab -U /mnt >> /mnt/etc/fstab
git clone -b $SYSTEM git@github.com:bweston6/dotfiles.git /mnt/dotfiles
echo "Chrooting into New System"
arch-chroot /mnt /bin/bash <<"EOT"
ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
hwclock --systohc
sed -i 's/#en_GB.UTF-8/en_GB.UTF-8/g' /etc/locale.gen
locale-gen
echo "LANG=en_GB.UTF-8" > /etc/locale.conf
echo "uk" > /etc/vconsole.conf

echo "Please Enter a Hostname:"
read hostname
echo $hostname > /etc/hostname
echo -e "127.0.0.1\tlocalhost\n::1\tlocalhost\n127.0.1.1\t$hostname.local\t$hostname" > /etc/hosts

mkinitcpio -P

echo "Please enter a root password:"
passwd

# Boot Manager
bootctl install
cp -a /tmp/dotfiles/.dotfiles/boot/loader /boot

# Setup Installer for Next Boot
cp -a /tmp/dotfiles/.dotfiles/onetime.service /etc/systemd/system/
cp -a /tmp/dotfiles/.dotfiles/onetime.sh /
systemctl enable onetime.service
EOT

# Cleaning Up
umount -R /mnt
reboot
