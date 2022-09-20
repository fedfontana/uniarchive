# Ideas

`/[course.as]/[[...path]]`

If path is a directory, then show its contents, else show the file itself

Each file may contain a yml info part at the top containing:

```yml
lastUpdate: 23/02/2022
lecture:
    date: 22/02/2022
    topics:
        - docker
        - virtualization
        - hypervisor
    name: "Introduction to Docker"
    professor: "Prof. Russo"
```

That will be used in the article meta and will be useful for filtering and sorting the notes

## Useful stuff

Convert b64 to string:

```js
Buffer.from(base64string, 'base64').toString()
```

Get github repo tree:

```txt
GET https://api.github.com/repos/<user>/<repo>/git/trees/<branch>?recursive=1
```

Get gitlab repo tree: ??
