function formatToMXN(amount) {
    const numero = Number(amount)
    if (typeof numero !== 'number') {
        throw new Error('El valor proporcionado debe ser un número.');
    }

    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

export default formatToMXN