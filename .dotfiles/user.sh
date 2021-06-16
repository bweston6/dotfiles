#!/bin/bash

YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`
SYSTEM="base"

# Installing oh-myzsh for user
echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for $USER...${RESET}"
RUNZSH=no
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Installing Yay/AUR packages
if ! command -v yay &> /dev/null
then
	echo "${YELLOW}:: ${MAGENTA}Installing yay...${RESET}"
	cd ~
	git clone https://aur.archlinux.org/yay.git
	cd yay
	makepkg -si
	cd ..
	rm -rf yay
fi
echo "${YELLOW}:: ${MAGENTA}Installing AUR packages...${RESET}"
yay -Syu systemd-boot-pacman-hook vi-vim-symlink

if test ! -f ~/.ssh/id_ed25519.pub;
then
	echo "${YELLOW}:: ${MAGENTA}Generating github ssh keys...${RESET}"
	ssh-keygen -t ed25519 -C "b.weston60@gmail.com"
	eval "$(ssh-agent -s)"
	ssh-add ~/.ssh/id_ed25519
	echo "${MAGENTA}Ensure the following key is added to your github account (press enter to continue):${RESET}"
	cat ~/.ssh/id_ed25519.pub
	read
fi

# Installing Dotfiles
echo "${YELLOW}:: ${MAGENTA}Installing dotfiles repo...${RESET}"
cd ~
git init
git remote add origin git@github.com:bweston6/dotfiles.git
git fetch
git reset origin/$SYSTEM
git checkout -t origin/$SYSTEM
git reset --hard HEAD

# Installing Vim-Plug Plugins
echo "${YELLOW}:: ${MAGENTA}Installing vim plugins...${RESET}"
vim +PlugInstall +PlugUpdate +PlugClean! +PlugUpgrade +qall
