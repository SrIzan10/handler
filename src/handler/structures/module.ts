import type {
    ApplicationCommandAttachmentOption,
    ApplicationCommandChannelOptionData,
    ApplicationCommandChoicesData,
    ApplicationCommandNonOptionsData,
    ApplicationCommandNumericOptionData,
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    ApplicationCommandSubCommandData,
    ApplicationCommandSubGroupData,
    AutocompleteInteraction,
    Awaitable,
    BaseApplicationCommandOptionsData,
    ButtonInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserContextMenuCommandInteraction,
} from 'discord.js';
import type { Args, Override, SlashOptions } from '../../types/handler';
import type { AutocompletePlugin, CommandPlugin, EventPlugin } from '../plugins/plugin';
import type Context from './context';
import { CommandType, EventType, PluginType } from './enums';
import type { DiscordEventCommand, ExternalEventCommand, SernEventCommand } from './events';

export interface BaseModule {
    type: CommandType | PluginType;
    name?: string;
    description?: string;
    execute: (ctx: Context, args: Args) => Awaitable<void | unknown>;
}

export type TextCommand = Override<
    BaseModule,
    {
        type: CommandType.Text;
        onEvent: EventPlugin<CommandType.Text>[]; //maybe allow BothPlugins for this also?
        plugins: CommandPlugin[]; //maybe allow BothPlugins for this also?
        alias?: string[];
        execute: (ctx: Context, args: ['text', string[]]) => Awaitable<void | unknown>;
    }
>;

export type SlashCommand = Override<
    BaseModule,
    {
        type: CommandType.Slash;
        onEvent: EventPlugin<CommandType.Slash>[]; //maybe allow BothPlugins for this also?
        plugins: CommandPlugin[]; //maybe allow BothPlugins for this also?
        options?: SernOptionsData[];
        execute: (ctx: Context, args: ['slash', SlashOptions]) => Awaitable<void | unknown>;
    }
>;

export type BothCommand = Override<
    BaseModule,
    {
        type: CommandType.Both;
        onEvent: EventPlugin<CommandType.Both>[];
        plugins: CommandPlugin[];
        alias?: string[];
        options?: SernOptionsData[];
        execute: (ctx: Context, args: Args) => Awaitable<void | unknown>;
    }
>;

export type ContextMenuUser = Override<
    BaseModule,
    {
        type: CommandType.MenuUser;
        onEvent: EventPlugin<CommandType.MenuUser>[];
        plugins: CommandPlugin[];
        execute: (ctx: UserContextMenuCommandInteraction) => Awaitable<void | unknown>;
    }
>;

export type ContextMenuMsg = Override<
    BaseModule,
    {
        type: CommandType.MenuMsg;
        onEvent: EventPlugin<CommandType.MenuMsg>[];
        plugins: CommandPlugin[];
        execute: (ctx: MessageContextMenuCommandInteraction) => Awaitable<void | unknown>;
    }
>;

export type ButtonCommand = Override<
    BaseModule,
    {
        type: CommandType.Button;
        onEvent: EventPlugin<CommandType.Button>[];
        plugins: CommandPlugin[];
        execute: (ctx: ButtonInteraction) => Awaitable<void | unknown>;
    }
>;

export type SelectMenuCommand = Override<
    BaseModule,
    {
        type: CommandType.MenuSelect;
        onEvent: EventPlugin<CommandType.MenuSelect>[];
        plugins: CommandPlugin[];
        execute: (ctx: SelectMenuInteraction) => Awaitable<void | unknown>;
    }
>;

export type ModalSubmitCommand = Override<
    BaseModule,
    {
        type: CommandType.Modal;
        onEvent: EventPlugin<CommandType.Modal>[];
        plugins: CommandPlugin[];
        execute: (ctx: ModalSubmitInteraction) => Awaitable<void | unknown>;
    }
>;

// Autocomplete commands are a little different
// They can't have command plugins as they are
// in conjunction with chat input commands
export type AutocompleteCommand = Override<
    BaseModule,
    {
        name?: never;
        description?: never;
        type?: never;
        onEvent: AutocompletePlugin[];
        execute: (ctx: AutocompleteInteraction) => Awaitable<void | unknown>;
    }
>;
export type EventModule = DiscordEventCommand | SernEventCommand | ExternalEventCommand;
export type CommandModule =
    | TextCommand
    | SlashCommand
    | BothCommand
    | ContextMenuUser
    | ContextMenuMsg
    | ButtonCommand
    | SelectMenuCommand
    | ModalSubmitCommand;

export type Module = CommandModule | EventModule;

//https://stackoverflow.com/questions/64092736/alternative-to-switch-statement-for-typescript-discriminated-union
// Explicit Module Definitions for mapping
export type CommandModuleDefs = {
    [CommandType.Text]: TextCommand;
    [CommandType.Slash]: SlashCommand;
    [CommandType.Both]: BothCommand;
    [CommandType.MenuMsg]: ContextMenuMsg;
    [CommandType.MenuUser]: ContextMenuUser;
    [CommandType.Button]: ButtonCommand;
    [CommandType.MenuSelect]: SelectMenuCommand;
    [CommandType.Modal]: ModalSubmitCommand;
};

export type EventModuleDefs = {
    [EventType.Sern]: SernEventCommand;
    [EventType.Discord]: DiscordEventCommand;
    [EventType.External]: ExternalEventCommand;
};

//TODO: support deeply nested Autocomplete
// objective: construct union of ApplicationCommandOptionData change any Autocomplete data
// into Sern autocomplete data.

export type SernAutocompleteData = Override<
    BaseApplicationCommandOptionsData,
    {
        autocomplete: true;
        type:
            | ApplicationCommandOptionType.String
            | ApplicationCommandOptionType.Number
            | ApplicationCommandOptionType.Integer;
        command: AutocompleteCommand;
    }
>;

/**
 * Type that replaces autocomplete with {@link SernAutocompleteData}
 */
export type BaseOptions =
    | ApplicationCommandChoicesData
    | ApplicationCommandNonOptionsData
    | ApplicationCommandChannelOptionData
    | ApplicationCommandNumericOptionData
    | ApplicationCommandAttachmentOption
    | SernAutocompleteData;

export type SernSubCommandData = Override<
    Omit<BaseApplicationCommandOptionsData, 'required'>,
    {
        type: ApplicationCommandOptionType.Subcommand;
        options?: BaseOptions[];
    }
>;

export type SernSubCommandGroupData = Override<
    Omit<BaseApplicationCommandOptionsData, 'required'>,
    {
        type: ApplicationCommandOptionType.SubcommandGroup;
        options?: SernSubCommandData[];
    }
>;

export type SernOptionsData<U extends ApplicationCommandOptionData = ApplicationCommandOptionData> =
    U extends ApplicationCommandSubCommandData
        ? SernSubCommandData
        : U extends ApplicationCommandSubGroupData
        ? SernSubCommandGroupData
        : BaseOptions;
