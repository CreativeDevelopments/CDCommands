# Contributing

We are looking for people to contribute to CDCommands.  
If you would like to contribute please read below.  
Anyone who does contribute if you would like the "Contributor" role in our Support Server please let us know (If your GitHub name is not similar to your Discord name we may not know who it was).  
Thank you in advance to anyone who is thinking of Contributing.

## Adding Supported Languages

If you would like to contribute by adding more languages, please first check to see if the language is already supported.  
You can do so by visiting [here](https://docs.creativedevelopments.org/cdcommands/development/supported-languages).  
If the language has not already been added please follow the steps below.

1. Fork our repository, you can do that [here](https://github.com/CreativeDevelopments/CDCommands).
2. Go to [src/Base/message.json](https://github.com/CreativeDevelopments/CDCommands/blob/main/src/Base/message.json) and copy from line [2](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/message.json#L2) all the way to line [237](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/message.json#L237).
3. Go to line [1423](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/message.json#L1423) (Note, this may change when more languages are added) and then add a , and make a new line to paste it in. 
4. Change "en" to the [ISO 639-1 Code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) of the language you are adding.
5. Translate everything in the "description". **DO NOT** translate the words inside the curly braces `{}`. For example where it says `{COMMAND} can only be used in a server`. You only translate the `can only be used in a server`, you can change the position of `{COMMAND}` so that it makes sense.
6. Once that file is done go to [src/Base/json-schema/message.json](https://github.com/CreativeDevelopments/CDCommands/blob/main/src/Base/json-schema/message.json) and copy line [11](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/json-schema/message.json#L11) all the way to line [454](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/json-schema/message.json#L454)
7. Go to line [2678](https://github.com/CreativeDevelopments/CDCommands/blob/3a2bb9cd0136962f5dae34addbc74e145e451dd6/src/Base/json-schema/message.json#L2679) (Note, this may change when more languages are added) and then add a `,` and make a new line to paste it in.
8. Translate everything in the `"examples"` and `"description"`. The `"examples"` are the same as the descriptions in the previous file, the `"descriptions"` are new phrases. Again, DO NOT translate the words in the curly braces `{}`.
9. Once everything is translated you can open a pull request for us to add it

## Other Contributions

If you would like to contribute in any other way, i.e. making extra functions, fixing bugs etc. Please fork the repository, make your changes then open a pull request. 
