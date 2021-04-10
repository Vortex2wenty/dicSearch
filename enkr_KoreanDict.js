// document.querySelector("#searchPage_entry > div > div:nth-child(1) > ul.mean_list > li > p");

class enkr_KoreanDict {
    // constructor() {
    //     this.options = null;
        // this.maxexample = 2;
        // this.word = '';
    // }

    // findTerm(word) {
    //     return new Promise((resolve, reject){
            // Your code starting here ...
            // resolve(content);
            // reject(error);

    //     });
    // }

    constructor() {
        this.options = null;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        // let locale = await api.locale();
        // if (locale.indexOf('CN') != -1) return '有道英汉简明';
        // if (locale.indexOf('TW') != -1) return '有道英漢簡明';
        return 'Naver Korean-English Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        //let deflection = await api.deinflect(word);
        let results = await Promise.all([this.findYoudao(word)]);
        return [].concat(...results).filter(x => x);
    }

    async findYoudao(word) {
        if (!word) return [];

        let base = 'http://korean.dict.naver.com/koendict/#/search?query=';
        let url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
            let youdao = getYoudao(doc);
            let ydtrans = youdao.length ? [] : getYDTrans(doc); //downgrade to Youdao Translation (if any) to the end.
            return [].concat(youdao, ydtrans);
        } catch (err) {
            return [];
        }

        function getYoudao(doc) {
            let notes = [];

            //get Youdao EC data: check data availability
            let defNodes = doc.querySelectorAll('#phrsListTab .trans-container ul li');
            if (!defNodes || !defNodes.length) return notes;

            //get headword and phonetic
            let expression = T(doc.querySelector("#searchPage_entry > div > div:nth-child(1) > ul.mean_list > li > p")); //headword
            let reading = '';
            let readings = doc.querySelectorAll('#phrsListTab .wordbook-js .pronounce');
            if (readings) {
                let reading_uk = T(readings[0]);
                let reading_us = T(readings[1]);
                reading = (reading_uk || reading_us) ? `${reading_uk} ${reading_us}` : '';
            }

            let audios = [];
            audios[0] = `https://korean.dict.naver.com/api/nvoice?speaker=mijin&service=dictionary&speech_fmt=mp3&text=${encodeURIComponent(expression)}&vcode=482237`;
            audios[1] = `https://korean.dict.naver.com/api/nvoice?speaker=mijin&service=dictionary&speech_fmt=mp3&text=${encodeURIComponent(expression)}&vcode=482237`;

            let definition = '<ul class="ec">';
            for (const defNode of defNodes) {
                let pos = '';
                let def = T(defNode);
                let match = /(^.+?\.)\s/gi.exec(def);
                if (match && match.length > 1) {
                    pos = match[1];
                    def = def.replace(pos, '');
                }
                pos = pos ? `<span class="pos simple">${pos}</span>` : '';
                definition += `<li class="ec">${pos}<span class="ec_chn">${def}</span></li>`;
            }
            definition += '</ul>';
            let css = `
                <style>
                    span.pos  {text-transform:lowercase; font-size:0.9em; margin-right:5px; padding:2px 4px; color:white; background-color:#0d47a1; border-radius:3px;}
                    span.simple {background-color: #999!important}
                    ul.ec, li.ec {margin:0; padding:0;}
                </style>`;
            notes.push({
                css,
                expression,
                reading,
                definitions: [definition],
                audios
            });
            return notes;
        }

        function getYDTrans(doc) {
            let notes = [];

            //get Youdao EC data: check data availability
            let transNode = doc.querySelectorAll('#ydTrans .trans-container p')[1];
            if (!transNode) return notes;

            let definition = `${T(transNode)}`;
            let css = `
                <style>
                    .odh-expression {
                        font-size: 1em!important;
                        font-weight: normal!important;
                    }
                </style>`;
            notes.push({
                css,
                definitions: [definition],
            });
            return notes;
        }

        function T(node) {
            if (!node)
                return '';
            else
                return node.innerText.trim();
        }

    }
}
