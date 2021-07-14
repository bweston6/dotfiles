YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`

if [[ $(id -u) -eq 0 ]];
then
	echo "${MAGENTA}Please run this script as the unprivaleged user.${RESET}"
	exit
fi

# Check for internet connection with DNS
if ! ping -q -c 1 -W 1 google.com >/dev/null; then
  echo "${MAGENTA}Ensure you are connected to the internet with DNS.${RESET}"
  exit
fi

# Set pacman Config
echo "${YELLOW}:: ${MAGENTA}Installing pacman config...${RESET}"
sudo sed -i "s/#Color/Color/g" /etc/pacman.conf
sudo sed -i "s/#ParallelDownloads/ParallelDownloads/g" /etc/pacman.conf

# Check for git and stow
if ! command -v stow &> /dev/null
then
	echo "${YELLOW}:: ${MAGENTA}Installing prerequesites...${RESET}"
	sudo pacman -Sy --needed --noconfirm stow
fi
if ! command -v git &> /dev/null
then
	echo "${YELLOW}:: ${MAGENTA}Installing prerequesites...${RESET}"
	sudo pacman -Sy --needed --noconfirm git
fi

# Copying Keys from USB
if ! [[ $(shasum ~/.ssh/id_ed25519 2>/dev/null) == "d4eb9049d94cab0a6360290da475c46a5878fb90"* ]];
then
	if ! mountpoint -q -- /run/media/*/KEYS;
	then
		echo "${MAGENTA}Ensure KEYS usb is mounted at /run/media/[user]/KEYS.${RESET}"
		exit
	fi
	echo "${YELLOW}:: ${MAGENTA}Copying encryption keys...${RESET}"
	mkdir -p ~/.ssh
	sudo cp /run/media/*/KEYS/id* ~/.ssh
	sudo chown 1000:1000 -R ~/.ssh
	sudo chmod 400 ~/.ssh/*
	gpg --import /run/media/*/KEYS/*.pgp
fi

# Installing omz
echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for $USER...${RESET}"
RUNZSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for root...${RESET}"
sudo RUNZSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

# Clone and Link Dotfiles
echo "${YELLOW}:: ${MAGENTA}Cloning dotfiles to $HOME...${RESET}"
if [[ $(shasum ~/.ssh/id_ed25519 2>/dev/null) == "d4eb9049d94cab0a6360290da475c46a5878fb90"* ]];
then
	git clone git@github.com:bweston6/dotfiles.git ~/.dotfiles
else
	git clone https://github.com/bweston6/dotfiles ~/.dotfiles
fi
echo "${YELLOW}:: ${MAGENTA}Deleting initial dotfiles...${RESET}"
sudo rm -rf /dotfiles
echo "${YELLOW}:: ${MAGENTA}Stowing dotfiles...${RESET}"
cd ~/.dotfiles/stow/home
stow -t ~/ -D *
rm -f ~/.zshrc*
stow -t ~/ -S *
cd ~/.dotfiles/stow/root
sudo stow -t / -D root-zsh pacman pulseaudio
sudo rm -f /root/.zshrc* /etc/pacman.conf /etc/pulse/daemon.conf
sudo stow -t / -S root-zsh pacman pulseaudio

# Installing yay and AUR Packages
if ! command -v yay &> /dev/null
then
	echo "${YELLOW}:: ${MAGENTA}Installing yay...${RESET}"
	cd ~
	git clone https://aur.archlinux.org/yay.git
	cd yay
	makepkg -si --noconfirm
	cd ~
	rm -rf yay
fi
echo "${YELLOW}:: ${MAGENTA}Updating and installing packages...${RESET}"
cd ~/.dotfiles
yay -Syu --needed --noconfirm systemd-boot-pacman-hook vi-vim-symlink chrome-gnome-shell etcher-bin gogh-git pulseaudio-modules-bt pulseeffects-legacy-git - < packages.txt

# Installing flatpak Packages
echo "${YELLOW}:: ${MAGENTA}Installing flatpak packages...${RESET}"
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install -y spotify microsoft.teams zoom

# Installing vim-plug Plugins
echo "${YELLOW}:: ${MAGENTA}Installing vim plugins...${RESET}"
vim +PlugInstall +PlugUpdate +PlugClean! +PlugUpgrade +qall

# Installing Terminal Theme
#echo "${YELLOW}:: ${MAGENTA}Installing \"cobalt2\" theme...${RESET}"
#echo 33 | gogh

# Logging into Accounts
echo "${MAGENTA}Log into any online accounts (close the window to continue):${RESET}"
gnome-control-center online-accounts

# Configuring dconf
echo "${YELLOW}:: ${MAGENTA}Restoring dconf preferences...${RESET}"
dconf reset -f /
dconf load / < ~/.dotfiles/dconf.ini
gnome-session-quit --no-prompt
