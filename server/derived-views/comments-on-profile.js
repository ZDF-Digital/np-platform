const { triggerOnObjectWrite } = require("./templates");

function CommentsOnProfileAsync({datastore, structureKey,instanceKey, value: comment}) {
    datastore.setDerivedObject({
        structureKey: 'profile', 
        instanceKey: comment.from, 
        type: 'comment', 
        key: comment.key, 
        value: {...comment, instanceKey, structureKey}
    });
}

exports.CommentsOnProfile = triggerOnObjectWrite('simplecomments', 'comment', 
    CommentsOnProfileAsync
);