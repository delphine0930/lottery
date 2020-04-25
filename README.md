## preperation

1. node.js
2. vscode
3. truffle
    - npm -g install truffle
4. ganache-cli
    - npm -g install ganache-clie
5. vscode extension (solidity- Juan Blanco)
6. metamask

원하는 path에서 truffle init 해주면 기본적으로 생성


## 기본 구조

- build/ : truffle compile 시 생김. contract 별로 따로 생김
- contracts/ : 여기에 원하는 contract 만들면 됨
- migrations/ : contracts 에 만든 contract 를 migrate 하기 위해 설정
- truffle-config.js : 이 프로젝트에서는 network > development 부분만 살려서 실행


## 실행법
``` console
$ truffle compile
$ truffle migrate --reset (왠만하면 붙여주자.. 이걸로 많이 망해봤잖아...)  
```
- terminal 에서 ganache-cli 돌리고 있었으면 거기에도 보임
- terminal에서 truffle console 로 들어가면 geth 처럼 사용 가능