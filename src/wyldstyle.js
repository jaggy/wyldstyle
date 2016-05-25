let filesystem = require('fs');
let chokidar   = require('chokidar');
let Builder    = require('./Builder');
let Tachyons   = require('./Tachyons');
let Cache      = require('./Cache');

let builder  = new Builder;
let tachyons = new Tachyons;
let cache    = new Cache;

let config = {
    ignored: /^(\.|.+\.([sl]*[aec]ss|styl))$/, // css, less, scss, sass, styl
};

module.exports = function (options) {
    chokidar.watch(options.directory, config).on('all', (event, filename) => {
        console.log(event, filename);

        // Read the file
        filesystem.readFile(filename, 'utf8', (error, data) => {
            if (error) { return; }

            let utilities = tachyons.extract(data);
            let styles    = builder.generateStyles(utilities);

            cache.push(filename, styles);

            // Write the file
            filesystem.writeFile(options.output, cache.compile().join("\n"), (error) => {
                if (error) { return console.log(error); }

                console.log(`File saved on ${options.output}`);
            });
        });
    });
}