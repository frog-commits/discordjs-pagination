"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagination = void 0;
const discord_js_1 = require("discord.js");
const pagination_i_1 = require("./pagination.i");
const defaultEmojis = {
    first: "⬅️",
    previous: "◀️",
    next: "▶️",
    last: "➡️",
    number: "#️⃣"
};
const defaultStyles = {
    first: pagination_i_1.ButtonStyles.Secondary,
    previous: pagination_i_1.ButtonStyles.Danger,
    next: pagination_i_1.ButtonStyles.Success,
    last: pagination_i_1.ButtonStyles.Secondary,
    number: pagination_i_1.ButtonStyles.Success
};
const pagination = async (options) => {
    const { client, interaction, message, ephemeral, author, disableButtons, deleteAtEnd, embeds, buttons, time, max, customFilter, fastSkip, pageTravel } = options;
    let currentPage = 1;
    const disableB = disableButtons || false;
    const ephemeralMessage = ephemeral !== null ? ephemeral : false;
    if (!interaction && !message)
        throw new Error("Pagination requires either an interaction or a message object");
    const type = interaction ? 'interaction' : 'message';
    const getButtonData = (type) => {
        return buttons?.find((btn) => btn.type === type);
    };
    const resolveButtonName = (type) => {
        return Object.keys(pagination_i_1.ButtonTypes).find((key) => {
            return pagination_i_1.ButtonTypes[key] === type;
        });
    };
    const generateButtons = (state) => {
        const checkState = (type) => {
            if (([1, 2]).includes(type) && currentPage === 1)
                return true;
            if (([5]).includes(type) && currentPage === 1 && embeds.length === 1)
                return true;
            return ([3, 4]).includes(type) && currentPage === embeds.length;
        };
        let names = [2, 3];
        if (fastSkip)
            names = [1, ...names, 4];
        if (pageTravel)
            names.push(5);
        return names.reduce((accumulator, type) => {
            let embed = new discord_js_1.ButtonBuilder()
                .setCustomId(type.toString())
                .setDisabled(state || checkState(type))
                .setStyle(getButtonData(type)?.style || defaultStyles[resolveButtonName(type)]);
            if (getButtonData(type)?.emoji !== null)
                embed.setEmoji(getButtonData(type)?.emoji || defaultEmojis[resolveButtonName(type)]);
            if (getButtonData(type)?.label)
                embed.setLabel(getButtonData(type)?.label);
            accumulator.push(embed);
            return accumulator;
        }, []);
    };
    const components = (state) => [
        new discord_js_1.ActionRowBuilder().addComponents(generateButtons(state))
    ];
    const changeFooter = () => {
        const embed = embeds[currentPage - 1];
        const embedJSON = embed.toJSON();
        const newEmbed = new discord_js_1.EmbedBuilder(embedJSON);
        if (Object.prototype.hasOwnProperty.call(embedJSON, 'footer')) {
            return newEmbed.setFooter({
                text: `Page ${currentPage} / ${embeds.length} - ${embedJSON.footer.text}`,
                iconURL: embedJSON.footer.icon_url
            });
        }
        return newEmbed.setFooter({
            text: `Page ${currentPage} / ${embeds.length}`
        });
    };
    let initialMessage;
    let channel = message?.channel || interaction?.channel;
    if (type === 'interaction' && channel) {
        await interaction.deferReply({ ephemeral: ephemeralMessage }).catch(() => ({}));
        initialMessage = await interaction.editReply({
            embeds: [changeFooter()],
            components: components()
        });
    }
    else {
        initialMessage = await channel.send({
            embeds: [changeFooter()],
            components: components()
        });
    }
    const defaultFilter = (interaction) => {
        return interaction.user.id === author.id && parseInt(interaction.customId) <= 4;
    };
    const collectorOptions = (filter) => {
        const opt = {
            filter: filter || customFilter || defaultFilter,
            componentType: discord_js_1.ComponentType.Button
        };
        if (max)
            opt["max"] = max;
        if (time)
            opt["time"] = time;
        return opt;
    };
    const collector = initialMessage.createMessageComponentCollector(collectorOptions());
    let collectorModal;
    if (pageTravel) {
        collectorModal = initialMessage.createMessageComponentCollector(collectorOptions((_i) => _i.user.id === author.id && parseInt(_i.customId) === 5));
        collectorModal.on("collect", async (btnInteraction) => {
            // Show modal
            const modal = new discord_js_1.ModalBuilder()
                .setCustomId('choose_page_modal')
                .setTitle('Choose Page');
            const inputPageNumber = new discord_js_1.TextInputBuilder()
                .setCustomId('page_number')
                .setLabel('Enter Page Number')
                .setStyle(discord_js_1.TextInputStyle.Short);
            const buildModal = new discord_js_1.ActionRowBuilder().addComponents(inputPageNumber);
            modal.addComponents(buildModal);
            await btnInteraction.showModal(modal);
            await btnInteraction.awaitModalSubmit({
                filter: (_i) => _i.user.id === author.id && _i.customId === 'choose_page_modal',
                time: 30000,
            }).then(async (i) => {
                const page_number = i.fields.getTextInputValue('page_number');
                const int = parseInt(page_number);
                if (isNaN(int))
                    return i.followUp({
                        content: `${i.member.user}, Please enter a valid page number!\n\`${page_number}\` is not a valid page number!`,
                        ephemeral: true
                    });
                if (int > embeds.length) {
                    currentPage = embeds.length;
                }
                else {
                    if (int <= 0) {
                        currentPage = 1;
                    }
                    else {
                        currentPage = int;
                    }
                }
                await i.update({
                    embeds: [changeFooter()],
                    components: components(),
                    ephemeral: ephemeralMessage
                });
            });
        });
    }
    collector.on("collect", async (btnInteraction) => {
        const btnType = parseInt(btnInteraction.customId);
        switch (btnType) {
            case 1:
                currentPage = 1;
                break;
            case 2:
                currentPage--;
                break;
            case 3:
                currentPage++;
                break;
            case 4:
                currentPage = embeds.length;
                break;
        }
        await btnInteraction.update({
            embeds: [changeFooter()],
            components: components()
        });
    });
    collector.on("end", () => {
        if (type === 'message') {
            if (deleteAtEnd) {
                initialMessage.delete()
                    .catch(() => ({}));
            }
            else {
                initialMessage.edit({
                    components: disableB ? components(true) : []
                }).catch(() => ({}));
            }
        }
        else {
            if (deleteAtEnd) {
                interaction.deleteReply()
                    .catch(err => {
                    if (err.code === 50027) {
                        console.log(`Webhook token has expired : ${client ? "trying to delete embed from it's id..." : "no client found in option, cannot delete embed"}`);
                        if (client) {
                            client.channels.fetch(interaction.channelId).then(channel => {
                                if (channel.isTextBased()) {
                                    channel.messages.delete(interaction.id);
                                }
                            }).then(() => {
                                console.log(`Message with ${initialMessage.id} id has been deleted successfully.`);
                            }).catch(err => console.log(`Channel does not exist or other error has been raised :\n${err}`));
                        }
                    }
                });
            }
            else {
                interaction.editReply({
                    components: disableB ? components(true) : []
                }).catch(() => ({}));
            }
        }
    });
};
exports.pagination = pagination;
//# sourceMappingURL=pagination.js.map