# nsec-map

Map of the Internet for the 2015 edition of NorthSec.

## Installation instructions

You will need an up to date installation of Node.js. Also required is
Grunt, which can be installed via node's package manager, `npm`:

    # npm install -g grunt-cli

Once this is done, navigate to `frontend` and run `npm install` to
automatically download and install (locally to the directory) all the
javascript dependencies. You can now run an instance of the map by
executing `grunt run`, from the same directory. The map can now be
accessed at `localhost:4000`. If needed, the port can be changed in
`Gruntfile.js`.
