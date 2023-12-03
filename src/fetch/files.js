const { parseDate } = require('../data/dates');
const { getFileURL } = require('../data/files');
const { withId, checkDuplicates } = require('../data/id');

const getFiles = require('./pronote/files');

async function files(session, user) {
    const files = await getFiles(session, user);
    if (!files) {
        return null;
    }

    const result = [];

    const subjects = {};
    for (const subject of files.listeMatieres.V) {
        subjects[subject.N] = subject.L;
    }

    for (const file of files.listeRessources.V) {
        if (file.ressource.V.url) {
            file.ressource.V.G = 0;
        } else {
            file.ressource.V.G = 1;
        }
        result.push(withId({
            time: parseDate(file.date.V),
            subject: subjects[file.matiere.V.N],
            name: file.ressource.V.L,
            url: getFileURL(session, {
                id: file.ressource.V.N,
                name: file.ressource.V.L,
                type: file.ressource.V.G,
                url: file.ressource.V.url
            }),
            type: file.ressource.V.G
        }, 'subject', 'name'));
    }

    return checkDuplicates(result);
}

module.exports = files;
