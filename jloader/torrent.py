import requests, re, sys, time, datetime
from bs4 import BeautifulSoup
from operator import eq
from app.fileManager import FileManager
from app.config import Config

# https://bitbucket.org/jochangmin/hacked-urllib2/src/master/


class Torrent:
    def __init__(self, site):
        self.site = site

        self.configure = Config()
        self.file_manager = FileManager();

    def equels(self, a, b):
        return eq(a, b)

    def getCategoryUrl(self):
        pass

    def getContentsFromURL(self, url, host = ''):
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; .NET4.0C; .NET4.0E; rv:11.0) like Gecko',
            'Referer': host
        }
        r = requests.get(url, headers=headers);
        r.encoding = None;

        if (r.status_code == 200):
            return r.text;
        else:
            return 0;

    # to comprehenssion
    def allowKeyFromlist(self, list, al_keys):
        al_keys = al_keys.split('/')
        clean_list = [];

        for item in list:
            for key in al_keys:
                if str(item).lower().find(key.lower()) != -1 :
                    clean_list.append(item);
                    continue

        return clean_list;

    # to comprehenssion
    def removeExceptKeyFromList(self, list, ex_keys):
        ex_keys = ex_keys.split('/')
        clean_list = [];
        for item in list:
            is_append = True;
            for key in ex_keys:
                if (str(item).lower().find(key.lower()) != -1):
                    is_append = False;
                    continue;

            if (is_append):
                clean_list.append(item);

        return clean_list;

    def isAddItemInTorrent(self, title):
        return not bool(self.file_manager.searchLine('download.txt', title))

    def getMagnetFromList(self, target = None, url = None, host = ''):
        pass

    def getTitleFromBsItem(self, item):
        pass

    # return margnet list
    def getSeedList(self, params):
        # try :
        margnet_list = []

        # get url from category name
        url, host = self.getCategoryUrl(params['params']['category_name'])
        list_page = self.getContentsFromURL(url, host)

        soup = BeautifulSoup(list_page, 'html.parser');

        f_l = self.getFindAll(soup)

        if 'allow_keyword' in self.configure.config_parser['INFO'] :
            f_l = self.allowKeyFromlist(f_l, self.configure.config_parser['INFO']['allow_keyword'])

        if 'except_keyword' in self.configure.config_parser['INFO'] :
            f_l = self.removeExceptKeyFromList(f_l, self.configure.config_parser['INFO']['except_keyword'])

        for c in f_l:
            try :
                t_t = self.getTitleFromBsItem(c)

                if self.isAddItemInTorrent(t_t):
                    data = self.getMagnetFromList(c, url, host)

                    if data:
                        data['title'] = t_t
                        margnet_list.append(data)
                time.sleep(1)
            except :
                continue

        del url, list_page, soup, f_l

        return margnet_list
