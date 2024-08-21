const { sendTemplatedEmailAsync } = require("../util/email");

async function sendNotifsForReplyApi({serverstore, language, parentKey, replyKey}) {
    const pParentComment = serverstore.getObjectAsync('comment', parentKey);
    const pReplyComment = serverstore.getObjectAsync('comment', replyKey);
    const pConversationName = serverstore.getGlobalPropertyAsync('name');
    const pSiloName = serverstore.getModulePublicAsync('admin', 'name');

    const parentComment = await pParentComment;
    const replyComment = await pReplyComment;
    const conversationName = await pConversationName;
    const siloName = await pSiloName ?? serverstore.getSiloKey().toUpperCase();
    const replyAuthorPersona = await serverstore.getPersonaAsync(replyComment.from);
    const toPersona = await serverstore.getPersonaAsync(parentComment.from);

    await sendTemplatedEmailAsync({
        templateId: 'reply-notif', language, 
        siloKey: serverstore.getSiloKey(), structureKey: serverstore.getStructureKey(), 
        instanceKey: serverstore.getInstanceKey(),
        toPersona,
        toUserId: parentComment.from, replyText: replyComment.text,
        siloName,
        replyAuthorName: replyAuthorPersona.name,
        conversationName: conversationName ?? 'Unnamed Conversation'
    });
}
exports.sendNotifsForReplyApi = sendNotifsForReplyApi;

exports.publicFunctions = {
    sendNotifsForReply: sendNotifsForReplyApi,
}

