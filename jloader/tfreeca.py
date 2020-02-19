import re, sys
from bs4 import BeautifulSoup
from app.torrent.torrent import Torrent
from urllib import parse


class Tfreeca(Torrent):
    def getMagnetFromList(self, contents, url, host):
        t_title = str(contents.string).strip();  # 게시물 제목
        m = re.search('[0-9]{3,}', contents.get('href'));  # 정규 표현식 적용하여 idx 값 획득
        idx = m.group(0);

        url_query= dict(parse.parse_qsl(parse.urlsplit(url).query))
        parse_contents_url = 'http://www.tfreeca22.com/torrent_info.php?bo_table=' + url_query['b_id'] + '&wr_id=' + idx;

        contents = self.getContentsFromURL(parse_contents_url, host);
        c_soup = BeautifulSoup(contents, 'html.parser');

        try:
            return {
                'title': c_soup.find('div', {"class": "torrent_file"}).string[:-9],
                'margnet': (c_soup.find("div", {"class": "torrent_magnet"})).find("a").get('href'),
            };
        except:
            return False;

    def getCategoryUrl(self, cate_name):
        url = None

        if self.equels(cate_name, 'MED') :
            url = '/board.php?mode=list&b_id=tent&ca=%EB%B0%A9%EC%98%81%EC%A4%91'
        elif self.equels(cate_name, 'DRA') :
            url = '/board.php?mode=list&b_id=tdrama&ca=%EB%B0%A9%EC%98%81%EC%A4%91'
        elif self.equels(cate_name, 'ODRA') :
            url = '/board.php?mode=list&b_id=tdrama&ca=%EB%AF%B8%EB%93%9C'
        elif self.equels(cate_name, 'DCU') :
            url = '/board.php?mode=list&b_id=tv'
        elif self.equels(cate_name, 'SPO') :
            url = '/board.php?mode=list&b_id=tv'
        elif self.equels(cate_name, 'ANI') :
            url = '/board.php?mode=list&b_id=tani&ca=%EB%B0%A9%EC%98%81%EC%A4%91'
        elif self.equels(cate_name, 'MUS') :
            url = '/board.php?mode=list&b_id=tmusic'
        elif self.equels(cate_name, 'UTL') :
            url = '/board.php?mode=list&b_id=util'

        return str(self.site)+url, str(self.site)

    def getFindAll(self, soup):
        return soup.findAll('a', {'class': ['stitle1', 'stitle2', 'stitle3', 'stitle4', 'stitle5', 'stitle6', 'stitle']})

    def getTitleFromBsItem(self, item):
        return str(item.string).strip().replace('™', '').replace('\'', '').replace(' 外', '')