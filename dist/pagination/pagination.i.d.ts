import { Client, Embed, Message, User, MessageComponentInteraction, CommandInteraction } from "discord.js";
export interface PaginationOptions {
    /**
     * Bot client, only useful if time >= 900000 (i.e greater than 15 minutes)
     */
    client?: Client;
    /**
     * Interaction to reply with the pagination system
     */
    interaction?: MessageComponentInteraction | CommandInteraction;
    /**
     * Message to send the pagination system
     */
    message?: Message;
    /**
     * Whether the reply should be ephemeral or not
     */
    ephemeral?: boolean;
    /**
     * Author's user class
     */
    author: User;
    /**
     * array of embed messages to paginate
     */
    embeds: Embed[];
    /**
     * customize your buttons!
     */
    buttons?: Buttons[];
    /**
     * Disable or remove buttons after timeout
     */
    disableButtons?: boolean;
    /**
      * Delete or not the embed or message after timeout
      */
    deleteAtEnd?: boolean;
    /**
     * travel pages by sending page numbers?
     */
    pageTravel?: boolean;
    /**
     * two additional buttons, a button to skip to the end and a button to skip to the first page
     */
    fastSkip?: boolean;
    /**
     * how long before pagination get disabled
     */
    time?: number;
    /**
     * maximum interactions before disabling the pagination
     */
    max?: number;
    /**
     * custom filter for message component collector
     */
    customFilter?(interaction: MessageComponentInteraction | CommandInteraction): boolean;
}
export declare const ButtonTypes: {
    readonly first: 1;
    readonly previous: 2;
    readonly next: 3;
    readonly last: 4;
    readonly number: 5;
};
export declare const ButtonStyles: {
    readonly Primary: 1;
    readonly Secondary: 2;
    readonly Success: 3;
    readonly Danger: 4;
    readonly Link: 5;
};
declare type KeysTypes = keyof typeof ButtonTypes;
declare type KeysStyles = keyof typeof ButtonStyles;
export declare type ButtonsTypes = typeof ButtonTypes[KeysTypes];
export declare type ButtonsStyles = typeof ButtonStyles[KeysStyles];
export interface Buttons {
    type: ButtonsTypes;
    style: ButtonsStyles;
    label?: string | null;
    emoji?: string | null;
}
export {};
