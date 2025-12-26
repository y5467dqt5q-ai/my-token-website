const QRCode = require('qrcode');
const fs = require('fs');

// Ссылка на покупку токена на Uniswap
const buyUrl = "https://app.uniswap.org/swap?outputCurrency=0x17fa1ccE5F0caD23C0805EB854043AD506327763&chain=mainnet";

async function generate() {
    console.log("Generating QR Code for:", buyUrl);

    // 1. Сохраняем как файл картинки (PNG)
    await QRCode.toFile('buy-mtk-qr.png', buyUrl, {
        color: {
            dark: '#000000',  // Черный код
            light: '#ffffff'  // Белый фон
        },
        width: 500,
        margin: 2
    });
    console.log("QR Code saved to: buy-mtk-qr.png");

    // 2. Выводим в терминал (чтобы сразу проверить телефоном)
    const string = await QRCode.toString(buyUrl, {type: 'terminal'});
    console.log(string);
}

generate().catch(console.error);
