#!/bin/bash

YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`

# Checking for Internet with DNS
if ! ping -q -c 1 -W 1 google.com >/dev/null; then
	echo "${MAGENTA}Ensure you are connected to the internet with DNS.${RESET}"
	exit
fi

# Ask to Confirm Mountpoints
if ! mountpoint -q -- "/mnt";
then
	echo "${MAGENTA}There is no filesystem mounted at /mnt.${RESET}"
	exit
elif ! mountpoint -q -- "/mnt/boot";
then
	echo "${MAGENTA}There is no filesystem mounted at /mnt/boot.${RESET}"
	exit
fi

# Installer pacman Config
echo "${YELLOW}:: ${MAGENTA}Installing pacman config...${RESET}"
sed -i "s/#Color/Color/g" /etc/pacman.conf
sed -i "s/#ParallelDownloads/ParallelDownloads/g" /etc/pacman.conf
sed -i "s/#[multilib]\n#Include = \/etc\/pacman.d\/mirrorlist/[multilib]\nInclude = \/etc\/pacman.d\/mirrorlist/g" /etc/pacman.conf

# Updating Mirror List
#echo "${YELLOW}:: ${MAGENTA}Updating mirror list...${RESET}"
#reflector --sort delay -f 10 -l 20 --completion-percent 100 --save /etc/pacman.d/mirrorlist

# Record Hostname for System Specialisations
echo "${MAGENTA}Please Enter a Hostname:${RESET}"
read hostname

# Installing Base Programs
echo "${YELLOW}:: ${MAGENTA}Installing packages...${RESET}"
pacman -Sy --noconfirm archlinux-keyring
pacstrap /mnt ansible base networkmanager

# Write Hostname to New System
echo $hostname > /mnt/etc/hostname
echo -e "127.0.0.1\tlocalhost\n::1\tlocalhost\n127.0.1.1\t$hostname.local\t$hostname" > /mnt/etc/hosts

# Genfstab
echo "${YELLOW}:: ${MAGENTA}Generating fstab...${RESET}"
genfstab -U -f /mnt/boot /mnt > /mnt/etc/fstab

# Copying Dotfiles to New System
echo "${YELLOW}:: ${MAGENTA}Copying dotfiles to new system...${RESET}"
cd ..
rm -rf /mnt/dotfiles
mkdir -p /mnt/dotfiles
shopt -s dotglob nullglob
cp -r ./* /mnt/dotfiles

# Chroot Into New System
echo "${YELLOW}:: ${MAGENTA}Chrooting into new system...${RESET}"
arch-chroot /mnt /dotfiles/.chroot.sh

# Configuring Bootloader
echo "${YELLOW}:: ${MAGENTA}Inserting PARTUUID into boot entry...${RESET}"
PARTUUID=$(findmnt /mnt -no PARTUUID)
sed -i "s/PARTUUID=\"/PARTUUID=$PARTUUID\"/g" /mnt/boot/loader/entries/arch.conf

echo "${MAGENTA}Please unmount /mnt (umount -R /mnt) and reboot. Then login and run \"/dotfiles/bootstrap.sh\".${RESET}"
