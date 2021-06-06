#!/bin/bash

# This is a one-time script to be run after installation. It installs all programs and initialises configuration.

# Ensure that dotfiles are in /tmp
SYSTEM="main"
git clone -b $SYSTEM git@github.com:bweston6/dotfiles.git /mnt/tmp/dotfiles

# Creating User
echo "Enter username for non-privileged user:"
read NAME
useradd -m -G wheel -s /bin/zsh $NAME
echo "Enter a password for $NAME (you will soon be editing the sudoers file; allow wheel access):"
passwd $NAME
visudo
mkdir -p /home/$NAME/.dotfiles/boot
chown -R $NAME:$NAME /home/$NAME/.dotfiles
echo -e "\n/boot\t/home/$NAME/.dotfiles/boot\tnone\tdefaults,bind\t0\t0" >> /etc/fstab
mount -a

# Configuring Network
echo "Configuring Network"
echo "Ensure that Ethernet is connected and press enter to continue:"
read
cp /mnt/tmp/dotfiles/etc/systemd/network/20-wired.network /etc/systemd/network/
systemctl enable --now systemd-networkd.service systemd-resolved.service

# Installing system-specific programs
echo "You may need to enter the password for $NAME:"
sudo -i -u $NAME zsh << EOT
# Installing oh-myzsh for user
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# Installing Yay
cd ~
git clone https://aur.archlinux.org/yay.git
cd yay
makepkg -si
cd ..
rm -rf yay
yay -Syu systemd-boot-pacman-hook vi-vim-symlink

# Installing Dotfiles
cd ~
git init
git remote add origin git@github.com:bweston6/dotfiles.git
git fetch
git reset origin/main
git checkout -t origin/master
git reset --hard HEAD

# Installing Vim-Plug Plugins
vim +PlugInstall +PlugUpdate +PlugClean! +PlugUpgrade +qall
EOT

# Installing oh-my-zsh for Root
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
cp /mnt/tmp/dotfiles/root/.zshrc /root

# Removing Script
systemctl disable onetime.service
rm /etc/systemd/system/onetime.service
echo "Please reboot to enact all changes."
rm -- "$0"
