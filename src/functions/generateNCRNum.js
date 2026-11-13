import axios from 'axios';

async function getAllNcrs() {
    const [forms, archives] = await Promise.all([
        axios.get('http://localhost:3000/ncrForms'),
        axios.get('http://localhost:3000/archives')
    ]);

    return [...forms.data, ...archives.data];
}

export async function generateNcrNumber() {
    const year = new Date().getFullYear();
    const allNCRs = await getAllNcrs();

    // Find the highest numeric database ID
    const ids = allNCRs
        .map(item => typeof item.id === 'string' && /^\d+$/.test(item.id) ? Number(item.id) : NaN)
        .filter(id => Number.isSafeInteger(id) && id > 0);

    const nextId = Math.max(0, ...ids) + 1;

    // Find the highest NCR number for this year
    const numbers = allNCRs
        .map(item => item.ncrNumber)
        .filter(number =>
            typeof number === 'string' &&
            number.startsWith(`${year}-`) &&
            /^\d{4}-\d+$/.test(number)
        )
        .map(number => Number(number.split('-')[1]));

    const nextNumber = Math.max(0, ...numbers) + 1;

    return {
        id: String(nextId),
        ncrNumber: `${year}-${String(nextNumber).padStart(3, '0')}`
    };
}

export async function isNcrIdentityAvailable(candidate) {
    const allNCRs = await getAllNcrs();

    return !allNCRs.some(item =>
        String(item.id) === candidate.id ||
        item.ncrNumber === candidate.ncrNumber
    );
}
