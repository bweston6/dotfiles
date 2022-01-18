#!/bin/bash

YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`
hostname=$(cat /etc/hostname)

# Setting Localisation
echo "${YELLOW}:: ${MAGENTA}Setting time zone...${RESET}"
ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
hwclock --systohc
echo "${YELLOW}:: ${MAGENTA}Setting locale...${RESET}"
sed -i 's/#en_GB.UTF-8/en_GB.UTF-8/g' /etc/locale.gen
sed -i 's/#en_US.UTF-8/en_US.UTF-8/g' /etc/locale.gen
locale-gen
echo "LANG=en_GB.UTF-8" > /etc/locale.conf
echo "KEYMAP=uk" > /etc/vconsole.conf

# Boot Manager
echo "${YELLOW}:: ${MAGENTA}Installing systemd-boot...${RESET}"
bootctl install
cp /dotfiles/systemd-boot/loader.conf /boot/loader
cp /dotfiles/systemd-boot/arch.conf /boot/loader/entries

# Setting root Password
echo "${MAGENTA}Please enter a root password:${RESET}"
passwd

# Creating User
echo "${MAGENTA}Enter username for non-privileged user:${RESET}"
read NAME
echo "${MAGENTA}Enter the full name of the user $NAME:${RESET}"
read COMMENT
useradd -c "$COMMENT" -m -G wheel -s /usr/bin/zsh $NAME
echo "${MAGENTA}Enter a password for $NAME (you will soon be editing the sudoers file; uncomment wheel access):${RESET}"
passwd $NAME
EDITOR=vim visudo

# Enabling NetworkManager
echo "${YELLOW}:: ${MAGENTA}Enabling NetworkManager...${RESET}"
systemctl enable NetworkManager
