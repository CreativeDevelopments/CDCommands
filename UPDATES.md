# Updates

All updates to the package will be put here.

> Note: Not all previous updates will be listed here, this was made after 3.1.4 was released.

<br>

# Versions

- [v1](#v1)
- [v2](#v2)
- [v3](#v3)
- [v4](#v4)

<br>

## v1

### 1.1.4

➕ Default logging using client.logError/Warn/Info/Ready/Database <br>
➖ Mustang Log<br>

### 1.1.5

✔️ Fixed guild being null<br>

### 1.2.1

➕ Added support for Linux<br>

### 1.2.3

➕ Stopped commands being case sensitive<br>

### 1.3.0

➕ Added message.json for custom responses<br>

### 1.3.2

✔️ Fixed RequiredRoles, Commands, Categories<br>

### 1.3.4

➖ Removed global cooldown from default commands<br>

<br>

## v2

### 2.0.0

➕ Cache rework

### 2.0.3

➖ Removed usage of Node v15 features <br>
✔️ Fixed error for users not on Node v15<br>

### 2.0.4

✔️ Fixed 'collection is not interable'<br>

<br>

## v3

### 3.0.0

➕ Argument Validator<br>

### 3.1.0

➕ Ability to add Features<br>

### 3.1.1 & 3.1.2

✔️ Fixed missing permissions error when removing user reactions on the help command<br>

### 3.1.4

➕ Changed the category for the help command<br>

## v4

### 4.0.0

➕ Added multiple languages<br>
➕ Added support for embeds in message.json<br>
➕ Added an option to not load selected default commands ('disabledDefaultCommands: []')<br>
➕ Added 'language' as a default command<br>

✔️ Fixed category being case sensitive for the help command

➖ Removed 'customHelpCommand' (Replaced with 'disabledDefaultCommands')

### 4.1.0

➖ Removed default export to allow for seemless ES2016+ support and ES2015 support.

- Replaced with named CDCommands export.<br>

➕ TypeScript Support<br>
➕ Init method for commands<br>
➕ Croatian added to the json-schema/message.json<br>
➕ Allowed for replacers for timestamp / inline<br>
➕ Fixed broken cooldown handling<br>
