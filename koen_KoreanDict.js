/* global api */
class koen_Naver {
    constructor(options) {
        this.options = options;
        this.maxexample = 2;
        this.word = '';
    }

    async displayName() {
        return 'Naver KO->EN Dictionary';
    }

    setOptions(options) {
        this.options = options;
        this.maxexample = options.maxexample;
    }

    async findTerm(word) {
        this.word = word;
        return await this.findCollins(word);
    }

    async findCollins(word) {
        if (!word) return null;

        let url = `http://www.kdict.org/search?q=${word}`;
        console.log(url);
        // let url = base + encodeURIComponent(word);
        let doc = '';
        try {
            let data = await api.fetch(url);
            let parser = new DOMParser();
            doc = parser.parseFromString(data, 'text/html');
        } catch (err) {
            console.log('Error with loading page: ' + err);
            return null;
        }

        // doc.querySelector("#searchPage_entry > div > div:nth-child(1)").remove();
        let content = doc.querySelector("#serp > ul:nth-child(1) > li:nth-child(1)") || '';
        // document.querySelector("#container > div > form > div > div.sub_left > div.search_result.mt25.printArea > dl:nth-child(1) > dd:nth-child(2)");
        // document.querySelector("#container > div > form > div > div.sub_left > div.search_result.mt25.printArea > dl:nth-child(1)")
        // document.querySelector("#serp > ul:nth-child(1) > li:nth-child(1)")
        console.log('Content: ' + content);
        if (!content) return null;
        let css = this.renderCSS();
        return css + content.innerHTML;
    }

    renderCSS() {
        let css = `
            <style>
                .copyright{
                    display:none;
                }
                .orth {
                    font-size: 100%;
                    font-weight: bold;
                }
                .quote {
                    font-style: normal;
                    color: #1683be;
                }
                .colloc {
                    font-style: italic;
                    font-weight: normal;
                }
                .sense {
                    border: 1px solid;
                    border-color: #e5e6e9 #dfe0e4 #d0d1d5;
                    border-radius: 3px;
                    padding: 5px;
                    margin-top: 3px;
                }
                .sense .re {
                    font-size: 100%;
                    margin-left: 0;
                }
                .sense .sense {
                    border: initial;
                    border-color: initial;
                    border-radius: initial;
                    padding: initial;
                    margin-top: initial;
                }
                a {
                    color: #000;
                    text-decoration: none;
                }
                * {
                    word-wrap: break-word;
                    box-sizing: border-box;
                }
            </style>`;

        return css;
    }
}
