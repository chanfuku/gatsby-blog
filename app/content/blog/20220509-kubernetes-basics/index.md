---
title: 【Kubernetes】よく使うkubectlコマンド
date: "2022-05-09T11:12:03.284Z"
description: "【Kubernetes】よく使うkubectlコマンド"
---

Kubernetes初心者です。随時追加・整理していきます。

## Referrence 
[kubectl Cheetsheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Check pods in particular namespace.
```
kubectl get pods -n <namespace名>
```

### Check all pods.
```
kubectl get pods -A
```

### Create pod with yaml file.
```
kubectl apply -f xxx.yaml
```

### Create pod with kubectl run.
```
kubectl run nginx --image=nginx
```

### Create base yaml file.
```
kubectl create deploy mysql --image=mysql:5.7 --dry-run=client -o yaml > file名.yaml
```

### Create and delete namespace with only command.
```
kubectl create namespace <namespace名> 
kubectl delete ns <namespace名>
```

### Keep watching the number of pods ※prerequisite: watch command must be installed
```
watch kubectl get pod
```

### Stream pod Logs
```
kubectl logs -f <pod名>
```

### Interactive shell access to a running pod
```
kubectl exec -it <pod名> sh
```
