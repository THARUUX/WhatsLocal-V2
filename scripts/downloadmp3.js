const fs = require('fs');
const ytdl = require('ytdl-core-discord');

function downloadyt(url){
    const videoUrl = url; // Replace with your YouTube video URL
    const fileName = 'output_video'; // Replace with your desired file name (without extension)
    
    const outputFilePath = `${fileName}.mp4`;
    
    const videoStream = ytdl(videoUrl, { quality: 'highestvideo', filter: 'videoandaudio' });
    const fileStream = fs.createWriteStream(outputFilePath);
    
    let downloadedBytes = 0;
    let totalBytes = 0;
    
    videoStream.on('response', (response) => {
      totalBytes = parseInt(response.headers['content-length'], 10);
    });
    
    videoStream.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      const progress = (downloadedBytes / totalBytes) * 100;
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(`Téléchargement en cours... ${progress.toFixed(2)}%`);
    });
    
    videoStream.pipe(fileStream);
    
    fileStream.on('finish', () => {
      console.log('\nTéléchargement terminé !');
    });
    
    fileStream.on('error', (error) => {
      console.error('\nUne erreur est survenue lors de l\'écriture du fichier :', error);
    });
}

module.exports = { downloadyt };