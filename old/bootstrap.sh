YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`
hostname=$(cat /etc/hostname)

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
if ! [[ $(shasum /etc/pacman.conf 2>/dev/null) == "04afd4589cfb743be2ade474cd42e6d61de54d3b"* ]];
then
	echo "${YELLOW}:: ${MAGENTA}Installing pacman config...${RESET}"
	sudo sed -i "s/#Color/Color/g" /etc/pacman.conf
	sudo sed -i "s/#ParallelDownloads/ParallelDownloads/g" /etc/pacman.conf
fi

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
	if mountpoint -q -- /run/media/*/KEYS;
	then
		echo "${YELLOW}:: ${MAGENTA}Copying encryption keys...${RESET}"
		mkdir -p ~/.ssh
		sudo cp /run/media/*/KEYS/id* ~/.ssh
		sudo chown 1000:1000 -R ~/.ssh
		sudo chmod 400 ~/.ssh/*
		gpg --import /run/media/*/KEYS/*.pgp
	else
		echo "${MAGENTA}Keys were not installed. Ensure KEYS usb is mounted at /run/media/[user]/KEYS.${RESET}"
	fi
fi

# Installing omz
if ! [[ -d ~/.oh-my-zsh ]]
then
	echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for $USER...${RESET}"
	RUNZSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
fi
if ! sudo bash -c '[[ -d /root/.oh-my-zsh ]]'
then
	echo "${YELLOW}:: ${MAGENTA}Installing oh-my-zsh for root...${RESET}"
	sudo RUNZSH=no sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"
fi

# Clone Dotfiles
if ! [[ -d ~/.dotfiles ]]
then
	echo "${YELLOW}:: ${MAGENTA}Cloning dotfiles to $HOME...${RESET}"
	if [[ $(shasum ~/.ssh/id_ed25519 2>/dev/null) == "d4eb9049d94cab0a6360290da475c46a5878fb90"* ]];
	then
		git clone git@github.com:bweston6/dotfiles.git ~/.dotfiles
	else
		git clone https://github.com/bweston6/dotfiles ~/.dotfiles
	fi
	echo "${YELLOW}:: ${MAGENTA}Deleting initial dotfiles...${RESET}"
	sudo rm -rf /dotfiles
fi

# Stow Dotfiles
echo "${YELLOW}:: ${MAGENTA}Stowing dotfiles...${RESET}"
if [[ $hostname == *"Laptop"* ]]
then
	HOME_PACKAGES="core* gnome* laptop*"
	ROOT_PACKAGES="core* gnome* laptop*"
	cd ~/.dotfiles/stow/root
	sudo stow -t / -D $ROOT_PACKAGES
	sudo rm -rf /etc/mkinitcpio.conf /etc/pacman.conf /root/.zshrc /usr/share/backgrounds/gnome/bell_heather_spekes_mill.jpg /etc/environment /usr/share/com.github.fabiocolacio.marker/scripts/mermaid/mermaid.min.js /usr/lib/systemd/system/packagekit-offline-update.service /etc/pulse/daemon.conf /usr/lib/udev/rules.d/61-mutter-primary-gpu.rules /etc/intel-undervolt.conf
	sudo stow -t / -S $ROOT_PACKAGES

	cd ~/.dotfiles/stow/home
	stow -t ~/ -D $HOME_PACKAGES
	rm -rf ~/.gitconfig ~/.vimrc ~/.vim/autoload ~/.zshrc ~/.local/share/gnome-shell/extensisions ~/Templates ~/.config/PulseEffects/output
	stow -t ~/ -S $HOME_PACKAGES
elif [[ $hostname == *"Desktop"* ]]
then
	HOME_PACKAGES="core* gnome*"
	ROOT_PACKAGES="core* gnome* desktop*"
	cd ~/.dotfiles/stow/root
	sudo stow -t / -D $ROOT_PACKAGES
	sudo rm -rf /etc/mkinitcpio.conf /etc/pacman.conf /root/.zshrc /usr/share/backgrounds/gnome/bell_heather_spekes_mill.jpg /etc/environment /usr/share/com.github.fabiocolacio.marker/scripts/mermaid/mermaid.min.js /usr/lib/systemd/system/packagekit-offline-update.service /etc/pulse/daemon.conf
	sudo stow -t / -S $ROOT_PACKAGES

	cd ~/.dotfiles/stow/home
	stow -t ~/ -D $HOME_PACKAGES
	rm -rf ~/.gitconfig ~/.vimrc ~/.vim/autoload ~/.zshrc ~/.local/share/gnome-shell/extensisions ~/Templates
	stow -t ~/ -S $HOME_PACKAGES
elif [[ $hostname == *"Serv"* ]]
then
	HOME_PACKAGES="core*"
	ROOT_PACKAGES="core* server*"
	cd ~/.dotfiles/stow/root
	sudo stow -t / -D $ROOT_PACKAGES
	sudo rm -rf /etc/mkinitcpio.conf /etc/pacman.conf /root/.zshrc /etc/systemd/network/20-wired.network
	sudo stow -t / -S $ROOT_PACKAGES

	cd ~/.dotfiles/stow/home
	stow -t ~/ -D $HOME_PACKAGES
	rm -rf ~/.gitconfig ~/.vimrc ~/.vim/autoload ~/.zshrc
	stow -t ~/ -S $HOME_PACKAGES
else
	HOME_PACKAGES="core*"
	ROOT_PACKAGES="core* server*"
	cd ~/.dotfiles/stow/root
	sudo stow -t / -D $ROOT_PACKAGES
	sudo rm -rf /etc/mkinitcpio.conf /etc/pacman.conf /root/.zshrc
	sudo stow -t / -S $ROOT_PACKAGES

	cd ~/.dotfiles/stow/home
	stow -t ~/ -D $HOME_PACKAGES
	rm -rf ~/.gitconfig ~/.vimrc ~/.vim/autoload ~/.zshrc
	stow -t ~/ -S $HOME_PACKAGES
fi	

sudo mkinitcpio -P

# Fixing Geoclue
if ! [[ $(shasum /etc/geoclue/geoclue.conf 2>/dev/null) == "5a60cf8f74710c8399a6ead2c13b076994d56b85"* ]];
then
	echo "${YELLOW}:: ${MAGENTA}Configuring Geoclue...${RESET}"
	sudo sed -i "s/#url=https:\/\/location.services.mozilla.com\/v1\/geolocate?key=YOUR_KEY/url=https:\/\/location.services.mozilla.com\/v1\/geolocate?key=geoclue/g" /etc/geoclue/geoclue.conf
	sudo sed -i "s/#submission-url=https:\/\/location.services.mozilla.com\/v1\/submit?key=YOUR_KEY/submission-url=https:\/\/location.services.mozilla.com\/v1\/submit?key=geoclue/g" /etc/geoclue/geoclue.conf
	sudo systemctl restart geoclue
fi

# Installing yay
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

# Updating and Installing Packages
echo "${YELLOW}:: ${MAGENTA}Updating and installing packages...${RESET}"
cd ~/.dotfiles/package-lists
yay -D --asdeps $(yay -Qq)
if [[ $hostname == *"Laptop"* ]]
then
	yay -D --asexplicit $(cat core-packages.txt laptop-packages.txt aur-core-packages.txt aur-laptop-packages.txt) $(yay -Sgq $(cat core-packages.txt laptop-packages.txt aur-core-packages.txt aur-laptop-packages.txt))
	yay -Syu --needed --removemake --noconfirm --useask $(cat core-packages.txt laptop-packages.txt aur-core-packages.txt aur-laptop-packages.txt)
	echo "[Desktop Entry] Hidden=true" > /tmp/1
	find /usr -name "*lsp_plug*desktop" 2>/dev/null | cut -f 5 -d '/' | xargs -I {} cp /tmp/1 ~/.local/share/applications/{}
elif [[ $hostname == *"Desktop"* ]]
then
	yay -D --asexplicit $(cat core-packages.txt desktop-packages.txt aur-core-packages.txt aur-desktop-packages.txt) $(yay -Sgq $(cat core-packages.txt desktop-packages.txt aur-core-packages.txt aur-desktop-packages.txt))
	yay -Syu --needed --removemake --noconfirm --useask $(cat core-packages.txt desktop-packages.txt aur-core-packages.txt aur-desktop-packages.txt)
elif [[ $hostname == *"Serv"* ]]
then
	yay -D --asexplicit $(cat core-packages.txt server-packages.txt aur-core-packages.txt aur-server-packages.txt) $(yay -Sgq $(cat core-packages.txt server-packages.txt aur-core-packages.txt aur-server-packages.txt))
	yay -Syu --needed --removemake --noconfirm --useask $(cat core-packages.txt server-packages.txt aur-core-packages.txt aur-server-packages.txt)
else
	yay -D --asexplicit $(cat core-packages.txt aur-core-packages.txt) $(yay -Sgq $(cat core-packages.txt aur-core-packages.txt))
	yay -Syu --needed --removemake --noconfirm --useask $(cat core-packages.txt aur-core-packages.txt)
fi	


# Removing unlisted packages
echo "${YELLOW}:: ${MAGENTA}Removing unlisted packages...${RESET}"
yay -Qtdq | yay -Rns -

# Installing vim-plug Plugins
echo "${YELLOW}:: ${MAGENTA}Installing vim plugins...${RESET}"
vim +PlugInstall +PlugUpdate +PlugClean! +PlugUpgrade +qall

# Laptop Specific
if [[ $hostname == *"Laptop"* ]]
then
	sudo systemctl restart intel-undervolt
fi

# Gnome Specific
if [[ $hostname == *"Laptop"* || $hostname == *"Desktop"* ]]
then
	# Installing flatpak Packages
	echo "${YELLOW}:: ${MAGENTA}Installing flatpak packages...${RESET}"
	flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
	flatpak install -y spotify microsoft.teams zoom

	# Installing Terminal Theme
	#echo "${YELLOW}:: ${MAGENTA}Installing \"cobalt2\" theme...${RESET}"
	#echo 33 | gogh

	# Logging into Accounts
	if ! [[ -f ~/.config/goa-1.0/accounts.conf ]]
	then
		echo "${MAGENTA}Log into any online accounts (close the window to continue):${RESET}"
		gnome-control-center online-accounts
	fi

	# Configuring dconf
	echo "${YELLOW}:: ${MAGENTA}Restoring dconf preferences...${RESET}"
	dconf reset -f /
	dconf load / < ~/.dotfiles/dconf.ini
	echo "${MAGENTA}It is recommended to logout to apply all changes (please accept the prompt):${RESET}"
	gnome-session-quit --logout
fi

# Server Specific
if [[ $hostname == *"Serv"* ]]
then
	echo "Put server things here. -- ignore me"
fi