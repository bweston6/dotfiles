YELLOW=`tput setaf 3`
MAGENTA=`tput setaf 5`
RESET=`tput sgr0`

# Creating User
echo "${MAGENTA}Enter username for non-privileged user:${RESET}"
read NAME
useradd -m -G wheel -s /bin/zsh $NAME
echo "${MAGENTA}Enter a password for $NAME (you will soon be editing the sudoers file; uncomment wheel access):${RESET}"
passwd $NAME
EDITOR=vim visudo

echo "${MAGENTA}Manually configure networking and run \"3.sh\" as root.${RESET}"
