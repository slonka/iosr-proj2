# iosr-proj2

Start load-balancer with:

```bash
PORT=5000 npm start
```

Run in another window and observe what happens

```bash
loadtest -c 1 --rps 2 http://localhost:5000
```

Kill `loadtest` after a while and observe how it scales down
