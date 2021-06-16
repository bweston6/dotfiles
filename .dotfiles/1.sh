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

# This section runs under the arch installer (as root)
echo "${YELLOW}:: ${MAGENTA}Installing pacman config...${RESET}"
sed -i "s/#Color/Color/g" /etc/pacman.conf
sed -i "s/#ParallelDownloads/ParallelDownloads/g" /etc/pacman.conf

echo "${YELLOW}:: ${MAGENTA}Installing prerequisites...${RESET}"
pacman -Syy --needed git

# Fetching System Branch
SYSTEM=$(git branch --show-current)
if [ "$SYSTEM" = "fatal: not a git repository (or any of the parent directories): .git" ];
then
	echo "${MAGENTA}Please run this script from within the dotfiles folder.${RESET}"
	exit
fi

# Installing Base Programs
echo "${YELLOW}:: ${MAGENTA}Updating mirror list...${RESET}"
reflector --sort delay -f 10 -l 20 --completion-percent 100 --save /etc/pacman.d/mirrorlist
echo "${YELLOW}:: ${MAGENTA}Installing packages...${RESET}"
pacstrap /mnt base linux linux-firmware - < packages.txt

# Configuring the System
echo "${YELLOW}:: ${MAGENTA}Generating fstab...${RESET}"
genfstab -U /mnt > /mnt/etc/fstab
git clone -b $SYSTEM git@github.com:bweston6/dotfiles.git /mnt/dotfiles
echo "${YELLOW}:: ${MAGENTA}Chrooting into new system...${RESET}"
arch-chroot /mnt /dotfiles/.dotfiles/chroot.sh
echo "${YELLOW}:: ${MAGENTA}Inserting PARTUUID into boot entry...${RESET}"
PARTUUID=$(findmnt /mnt -no PARTUUID)
sed -i "s/PARTUUID=\"/PARTUUID=$PARTUUID\"/g" /mnt/boot/loader/entries/arch.conf

echo "${MAGENTA}Please unmount /mnt (umount -R /mnt) and reboot. Then run \"2.sh\".${RESET}"
