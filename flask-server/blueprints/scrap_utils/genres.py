import re
import pandas as pd
import numpy as np


class GenresSmasher:
    def __init__(self, fetch):
        self.fetch = fetch
        self.master = []
        self.stats = []

    def create_data(self):
        genres_input = self.fetch['genres']
        for element in genres_input:
            arr = re.sub("\[|\]|\'|\'", "", element).split(', ')
            self.master.append(arr)

    def create_stats(self):
        temp = []
        for element in self.master:
            temp += element

        genre, count = np.unique(temp, return_counts=True)
        self.stats = [(g, c) for (g, c) in zip(genre, count)]

    def check_patterns(self, element):
        dfS = pd.DataFrame(self.stats, columns=['genre', 'count'])
        dfS = dfS.assign(alpha=lambda x: x['genre'].str.replace(' |-|&', '', regex=True))

        dfE = pd.DataFrame(element, columns=['genre'])
        dfE = dfE.assign(alpha=lambda x: x['genre'].str.replace(' |-|&', '', regex=True))

        alpha = set(dfE['alpha'])

        clean = []
        for a in alpha:
            stats = dfS[dfS['alpha'] == a]
            g_name = stats.loc[stats['count'] == stats['count'].max()]['genre'].values[0]
            clean.append(g_name)

        return clean

    def smash(self):
        self.create_data()
        self.create_stats()

        clean = []
        for element in self.master:
            result = self.check_patterns(element)
            clean.append(str(result))

        dfJ = self.fetch.join(pd.DataFrame({'genre_new': clean}))
        dfJ = dfJ.drop(columns=['genres'], axis=1).rename(columns={'genre_new': 'genres'})

        return dfJ
