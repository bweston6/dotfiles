#!/bin/bash

YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`

echo "${YELLOW}:: ${MAGENTA}Setting time zone...${RESET}"
ln -sf /usr/share/zoneinfo/Europe/London /etc/localtime
hwclock --systohc
echo "${YELLOW}:: ${MAGENTA}Setting locale...${RESET}"
sed -i 's/#en_GB.UTF-8/en_GB.UTF-8/g' /etc/locale.gen
locale-gen
echo "LANG=en_GB.UTF-8" > /etc/locale.conf
echo "KEYMAP=uk" > /etc/vconsole.conf

echo "${MAGENTA}Please Enter a Hostname:${RESET}"
read hostname
echo $hostname > /etc/hostname
echo -e "127.0.0.1\tlocalhost\n::1\tlocalhost\n127.0.1.1\t$hostname.local\t$hostname" > /etc/hosts

# Enabling early KMS
echo "${YELLOW}:: ${MAGENTA}Enabling early KMS...${RESET}"
sed -i 's/MODULES=()/MODULES=(i915)/g' /etc/mkinitcpio.conf
mkinitcpio -P

# Boot Manager
echo "${YELLOW}:: ${MAGENTA}Installing systemd-boot...${RESET}"
bootctl install
cp -r /dotfiles/boot/loader /boot

# Setting root Password
echo "${MAGENTA}Please enter a root password:${RESET}"
passwd

# Creating User
echo "${MAGENTA}Enter username for non-privileged user:${RESET}"
read NAME
echo "${MAGENTA}Enter the full name of the non-privileged user:${RESET}"
read COMMENT
useradd -c "$COMMENT" -m -G wheel -s /bin/zsh $NAME
echo "${MAGENTA}Enter a password for $NAME (you will soon be editing the sudoers file; uncomment wheel access):${RESET}"
passwd $NAME
EDITOR=vim visudo

# Enabling Services
echo "${YELLOW}:: ${MAGENTA}Enabling services...${RESET}"
systemctl enable --now bluetooth cups NetworkManager gdm
