const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 8000;
const host = '127.0.0.1';
const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.json': 'application/json; charset=utf-8'
};

const serveFile = (filePath, res) => {
    res.writeHead(200, {
        'Content-Type': types[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
    });
    fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    if (urlPath === '/mowangcheng' || urlPath === '/mowangcheng/') {
        urlPath = '/mowangcheng/index.html';
    }

    const filePath = path.resolve(root, `.${urlPath}`);
    if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (error, stat) => {
        if (error || !stat.isFile()) {
            if (urlPath.startsWith('/mowangcheng/') && !path.extname(urlPath)) {
                serveFile(path.join(root, 'mowangcheng', 'index.html'), res);
                return;
            }
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }

        serveFile(filePath, res);
    });
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Close the other server or change PORT in startgame.bat.`);
    } else {
        console.error(error);
    }
    process.exit(1);
});

server.listen(port, host, () => {
    console.log(`Serving ${root}`);
    console.log(`Open http://${host}:${port}/`);
    console.log('Press Ctrl+C or close this window to stop the server.');
});
