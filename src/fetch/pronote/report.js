const parse = require('../../data/types');
const { toPronote } = require('../../data/objects');

const navigate = require('./navigate');

const PAGE_NAME = 'PageBulletins';
const TAB_ID = 13;
const ACCOUNTS = ['student', 'parent'];

async function getReport(session, user, period)
{
    const report = await navigate(session, user, PAGE_NAME, TAB_ID, ACCOUNTS, {
        periode: period.name ? toPronote(period) : period,
        classe: {},
        eleve: {}
    });

    if (!report) {
        return null;
    }

    if (report.Message) {
        return {
            message: report.Message
        }
    }
    const globalComments = parse(report.ObjetListeAppreciations).ListeAppreciations.V.map(comment => ({
        text: comment.L,
        id: comment.N,
        title: comment.Intitule
    }));


    const teacherComments = report.ListeServices.V.map(subject => {
        const data = {
            name: subject.L,
            id: subject.N,
            teachers: parse(subject.ListeProfesseurs) ?? [],
            color: subject.couleur,
            studentAverage: subject.MoyenneEleve,
            studentClassAverage: subject.MoyenneClasse,
            minAverage: subject.MoyenneInf,
            maxAverage: subject.MoyenneSup,
            comments: parse(subject.ListeAppreciations)
        }

        if (subject.ListeElements) {
            subject.ListeElements.V.forEach(element => {
                data.teachers = data.teachers.concat(parse(element.ListeProfesseurs));
                data.comments = data.comments.concat(parse(element.ListeAppreciations));
            });
        }

        return data;
    });


    return {
        studentClass: parse(report.Classe),
        studentName: parse(report.eleve),
        studentAverage: parse(report.General).MoyenneEleve,
        studentClassAverage: parse(report.General).MoyenneClasse,
        globalComments,
        teacherComments,
        absences: parse(report.ListeAbsences)
    };
}

module.exports = getReport;
