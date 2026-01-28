# blog-aggregator

aggreGATOR 🐊. Is a CLI tool that allows users to:

- Add RSS feeds from across the internet to be collected
- Store the collected posts in a PostgreSQL database
- Follow and unfollow RSS feeds that other users have added
- View summaries of the aggregated posts in the terminal, with a link to the full post

RSS feeds are a way for websites to publish updates to their content. You can use this project to keep up with your favorite blogs, news sites, podcasts, and more!

## Prerequisites

The following tools are necessary in oder for the aggregator can run via the CLI:

### Nodejs

- Nodejs set to version `22.15.0`
- npm install _(to install node modules)_

### Config

- config file in home directory ex: `~./gatorconfig.json`

```json
{
  "db_url": "postgres://example"
}
```

### Postgres SQL server

1.[] Install Postgres

macOS with brew:

```shell
brew install postgresql@16
```

Linux / WSL (Debian):

```shell
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2.[] Ensure the installation worked. The psql command-line utility is the default client for Postgres. Use it to make sure you're on version 16+ of Postgres:

```shell
psql --version
```

3.[] (Linux only) Update postgres password:

```shell
sudo passwd postgres
```

Enter a password, and be sure you won't forget it.

4. [ ] Start the Postgres server in the background

- Mac: `brew services start postgresql@16`
- Linux: `sudo service postgresql start`

  5.[] Connect to the server. I recommend simply using the psql client. It's the "default" client for Postgres, and it's a great way to interact with the database. While it's not as user-friendly as a GUI like PGAdmin, it's a great tool to be able to do at least basic operations with.

Enter the psql shell:

- Mac: `psql postgres`
- Linux: `sudo -u postgres psql`

You should see a new prompt that looks like this:

```shell
postgres=#
```

6.[] Create a new database. I called mine gator:

```shell
CREATE DATABASE gator;
```

7.[] Connect to the new database

```shell
\c gator
```

You should see a new prompt that looks like this:

```shell
gator=#
```

8.[] Set the user password (Linux only)

```shell
ALTER USER postgres PASSWORD 'postgres';
```

9.[] Query the database

From here you can run SQL queries against the gator database. For example, to see the version of Postgres you're running, you can run:

```shell
SELECT version();
```

You can type exit or use \q to leave the psql shell.
