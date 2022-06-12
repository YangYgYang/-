const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
}

// let openCardNode = ''


//////////////////////model//////////////////////
const model = {
    revealedCards: [],
    isRevealedCardsMatched(card) {
        console.log('matchOrNot', this.revealedCards[0])
        console.log('暫存卡片', card)
            //陣列裡面可以存node嗎？
        if (this.revealedCards[0].firstElementChild.textContent === card.firstElementChild.textContent) {
            console.log(true)
            return true
        } else {
            console.log(false)
            return false
        }
    },
    score: 0,
    triedTimes: 1
}


//////////////////////utility function//////////////////////
let randomNum = Math.trunc(Math.random() * 52) // 0-51

//這裡居然有這個問題了，utility要放在前面(後面的displayCards才拿得到這個function)
const utility = {
        mixupCard(array) {
            let result = []
            let count = array.length
                //給一個這個陣列裡面index的數 把那個index拿出來 再重新做一次直到原本的array.length =0
            for (let i = 0; i < count; i++) {
                let random = Math.trunc(Math.random() * array.length)
                result.push(array[random])
                array.splice(random, 1)
            }
            return result
        }


    }
    //////////////////////view//////////////////////
const view = {
    displayCards(cardQuantity) {
        const rootElement = document.querySelector("#cards")
        let allCard = []

        //以下可用Array.from(Array(52).keys())產生0-51的陣列
        for (let i = 0; i < cardQuantity; i++) { allCard.push(i) }
        allCard = utility.mixupCard(allCard)
        allCard.forEach((e) => {
            rootElement.innerHTML += `${this.getCardElement(e,0)}`
        })

    },
    //////type傳入不同參數，會return不同結果
    getCardElement(index, type) {
        let num = index % 13 //0-12 
        let shape = Math.trunc(index / 13)

        num = this.transforNumber(num)
        if (type === 0) {
            return `
            <div class="card back" data-id=${index}>
            </div>
            `
        } else if (type === 1) {
            return `
            <p>${num}</p>
            <img src="${Symbols[shape]}">
            <p>${num}</p>
            `
        }
    },
    //可改寫用物件取AJQK
    transforNumber(num) {
        if (num === 0) {
            return "A"
        } else if (num === 10) {
            return "J"
        } else if (num === 11) {
            return "Q"
        } else if (num === 12) {
            return "K"
        } else {
            return num + 1
        }
    },
    ////展開運算子跟foreach使用方式其實一樣嗎？？
    flipCards(card) {
        //如果classList裡面有back就回傳正面
        if (card.classList.contains('back')) {
            card.classList.remove('back')
            card.innerHTML = `${view.getCardElement(card.dataset.id,1)}`

        }
        //如果classLiss沒有就回加上去
        else {
            card.classList.add('back')
            card.innerHTML = ``
        }
    },
    paireds(card) {
        card.classList.add('paired')
    },
    renderScore(score) {
        document.querySelector('.score').innerHTML = `Score: ${score}`
    },
    renderTriedTimes(times) {
        document.querySelector('.tried').innerHTML = `You've tried: ${times} times`

    }
}


//////////////////////流程function//////////////////////
const controller = {
    //預設初始遊戲狀態為firstcardAwait
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(52)
    },
    dispatchCardAction(card) {
        if (!card.classList.contains('back')) {
            return
        }
        // switch的作用是會if和else if嗎？要實驗一下(好像跟很多if的概念比較像)
        switch (this.currentState) {
            case GAME_STATE.FirstCardAwaits:
                // openCardNode = card.outerHTML
                view.flipCards(card)
                view.renderTriedTimes(model.triedTimes++)
                model.revealedCards.push(card)
                this.currentState = GAME_STATE.SecondCardAwaits

                break
            case GAME_STATE.SecondCardAwaits:
                // openCardNode = card.outerHTML
                view.flipCards(card)
                model.revealedCards.push(card)
                if (model.isRevealedCardsMatched(card)) {
                    this.currentState = GAME_STATE.CardsMatched
                    view.paireds(model.revealedCards[0])
                    view.paireds(model.revealedCards[1])
                    model.revealedCards = []
                    view.renderScore(model.score += 10)
                    this.currentState = GAME_STATE.FirstCardAwaits
                } else {
                    //沒翻到一樣的(就要翻回去)
                    this.currentState = GAME_STATE.CardsMatchFailed
                    setTimeout(() => { this.resetCards() }, 1000)
                }
                break
        }
    },
    //////這裡的controller.currentState不能寫this.currentState
    resetCards() {
        view.flipCards(model.revealedCards[0])
        view.flipCards(model.revealedCards[1])
        model.revealedCards = []
        controller.currentState = GAME_STATE.FirstCardAwaits
    }
}




//////////////////////執行//////////////////////
controller.generateCards()
    //監聽器要掛在卡片容器上
document.querySelectorAll('.card').forEach((card) => card.addEventListener('click', event => controller.dispatchCardAction(card)))