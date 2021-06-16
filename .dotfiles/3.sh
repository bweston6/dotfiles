#!/bin/bash

YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`

# This is a one-time script to be run after installation. It installs all programs and initialises configuration.
# Check that script is run as root
if [[ $(id -u) -ne 0 ]];
then
	echo "${MAGENTA}Please run this script as root${RESET}"
	exit
fi

# Check for internet connection with DNS
if ! ping -q -c 1 -W 1 google.com >/dev/null; then
  echo "${MAGENTA}Ensure you are connected to the internet with DNS.${RESET}"
  exit
fi

# Ensure that dotfiles are in /tmp
SYSTEM="base"
git clone -b $SYSTEM git@github.com:bweston6/dotfiles.git /dotfiles

# Installing system-specific programs
echo "${YELLOW}:: ${MAGENTA}Installing pacman config...${RESET}"
sed -i "s/#Color/Color/g" /etc/pacman.conf
sed -i "s/#ParallelDownloads/ParallelDownloads/g" /etc/pacman.conf

echo "${YELLOW}:: ${MAGENTA}Changing to user 1000...${RESET}"
sudo -i -u \#1000 /dotfiles/.dotfiles/user.sh

# Installing oh-my-zsh for Root
echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for root...${RESET}"
RUNZSH=no
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
cp /dotfiles/.dotfiles/root/.zshrc /root
