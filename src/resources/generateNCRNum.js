import axios from 'axios';

export async function generateNcrNumber() {
    const year = new Date().getFullYear();

    const [forms, archives] = await Promise.all([
        axios.get('http://localhost:3000/ncrForms'),
        axios.get('http://localhost:3000/archives')
    ]);

    const allNCRs = [...forms.data, ...archives.data];

    // Find the highest numeric database ID
    const ids = allNCRs
        .map(item => Number(item.id))
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

