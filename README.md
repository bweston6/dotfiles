# Dotfiles
The plain is to have a script that will take you from an Arch installer to a working installation. You will start from mounted partitions and the install script will ask for a hostname. The install script will take it from there.

There will be three classes of install that extend eachother:

* `base` - Includes base dotfiles for a console install with no networking configured.
  * `server` - The setup that is curently deployed to my home server.
  * `desktop` - A desktop installation based on Gnome and all my programs.
    * `laptop` - Extension of `desktop` that includes drivers for intel graphics drivers and hardware decoding. Also includes `pulseeffects-legacy`.
    * `computer` - Install meant for my desktop computer with amd graphics drivers and hardware decoding. Also includes a vfio setup for gpu passthrough to a windows vm.
