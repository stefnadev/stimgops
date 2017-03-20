# StimgOps - Stefna Image Optimizer Server

Service to optimize images using mozjpeg and optipng.

## Usage:
```bash
./index.js -h

  Usage: index [options]

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    -p, --port <n>        Listening port
    -m, --max-width <n>   Maximum width of images
    -c, --concurrent <n>  Concurrent processes

```

## Defaults
* Default port (-p): 8082
* Allowed concurrent processes (-c): 2
* Maximum width of images (-m): 2000

## Authors:
* biggi@stefna.is

## License
See Licence file
